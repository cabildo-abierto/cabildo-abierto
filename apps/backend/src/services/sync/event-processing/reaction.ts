import {
    getCollectionFromUri,
    getDidFromUri,
    isRepost
} from "@cabildo-abierto/utils";
import {Transaction} from "kysely";
import {ReactionRecord, ReactionType} from "#/services/reactions/reactions.js";
import {v4 as uuidv4} from 'uuid'
import {isTopicVote} from "#/services/wiki/votes.js";
import {unique} from "@cabildo-abierto/utils";
import {NotificationJobData} from "#/services/notifications/notifications.js";
import {isReactionCollection} from "#/utils/type-utils.js";
import {
    addUpdateContributionsJobForTopics
} from "#/services/sync/event-processing/topic.js";
import {DB} from "prisma/generated/types.js";
import {InsertRecordError, RecordProcessor} from "#/services/sync/event-processing/record-processor.js";
import {AppBskyFeedLike, AppBskyFeedRepost} from "@atproto/api"
import {
    ArCabildoabiertoWikiVoteAccept,
    ArCabildoabiertoWikiVoteReject
} from "@cabildo-abierto/api"
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {updateTopicsCurrentVersionBatch} from "#/services/wiki/current-version.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {Effect, pipe} from "effect";

import {AddJobError, InvalidValueError} from "#/utils/errors.js";


const columnMap: Record<ReactionType, keyof DB['Record']> = {
    'app.bsky.feed.like': 'uniqueLikesCount',
    'app.bsky.feed.repost': 'uniqueRepostsCount',
    'ar.cabildoabierto.wiki.voteAccept': 'uniqueAcceptsCount',
    'ar.cabildoabierto.wiki.voteReject': 'uniqueRejectsCount',
}

function isLikeOrRepost(r: RefAndRecord) {
    return ["app.bsky.feed.like", "app.bsky.feed.repost"].includes(getCollectionFromUri(r.ref.uri))
}

export class ReactionRecordProcessor extends RecordProcessor<ReactionRecord> {
    addRecordsToDB(records: RefAndRecord<ReactionRecord>[], reprocess: boolean = false) {
        records = records.filter(r => {
            return isReactionType(getCollectionFromUri(r.ref.uri))
        })
        if (records.length == 0) return Effect.succeed(0)

        const reactionType = getCollectionFromUri(records[0].ref.uri)
        if (!isReactionType(reactionType)) return Effect.fail(new InvalidValueError(`Reacción inválida: ${reactionType}`))

        const insertReactions = this.ctx.kysely.transaction().execute(async (trx) => {

            await this.processRecordsBatch(trx, records)

            const subjects = records.map(r => ({uri: r.record.subject.uri, cid: r.record.subject.cid}))
            const reasons = records
                .map(r => ArCabildoabiertoWikiVoteReject.isRecord(r.record) ? r.record.reason : null).filter(x => x != null)
            await this.processDirtyRecordsBatch(trx, [...subjects, ...reasons])

            const reactions = records.map(r => ({
                uri: r.ref.uri,
                subjectId: r.record.subject.uri,
                subjectCid: r.record.subject.cid
            }))

            await trx
                .insertInto("Reaction")
                .values(reactions)
                .onConflict((oc) =>
                    oc.column("uri").doUpdateSet({
                        subjectId: eb => eb.ref('excluded.subjectId'),
                        subjectCid: eb => eb.ref("excluded.subjectCid")
                    })
                )
                .execute()

            const hasReacted = records.map(r => ({
                userId: getDidFromUri(r.ref.uri),
                recordId: r.record.subject.uri,
                reactionType: getCollectionFromUri(r.ref.uri),
                id: uuidv4()
            }))

            const inserted = await trx
                .insertInto("HasReacted")
                .values(hasReacted)
                .onConflict(oc => oc.columns(["recordId", "reactionType", "userId"]).doNothing())
                .returning(['recordId'])
                .execute()

            await this.batchIncrementReactionCounter(trx, reactionType, inserted.map(r => r.recordId))

            if (isTopicVote(reactionType)) {
                if (reactionType == "ar.cabildoabierto.wiki.voteReject") {
                    const votes: { uri: string, reasonId: string | undefined, labels: string[] }[] = records.map(r => {
                        if (ArCabildoabiertoWikiVoteReject.isRecord(r.record)) {
                            return {
                                uri: r.ref.uri,
                                reasonId: r.record.reason?.uri,
                                labels: []
                            }
                        }
                        return null
                    }).filter(v => v != null)

                    try {
                        await trx
                            .insertInto("VoteReject")
                            .values(votes)
                            .onConflict((oc) =>
                                oc.column("uri").doUpdateSet({
                                    reasonId: (eb) => eb.ref('excluded.reasonId'),
                                })
                            )
                            .execute()
                    } catch (err) {
                        this.ctx.logger.pino.info({error: err}, "error inserting vote reject")
                        throw err
                    }
                }

                if (records.length > 0 && inserted.length > 0) {
                    let topicVotes = (await trx
                        .selectFrom("TopicVersion")
                        .innerJoin("Reaction", "TopicVersion.uri", "Reaction.subjectId")
                        .select([
                            "TopicVersion.topicId",
                            "TopicVersion.uri",
                            "Reaction.uri as reactionUri"
                        ])
                        .where("Reaction.uri", "in", records.map(r => r.ref.uri))
                        .where("TopicVersion.uri", "in", inserted.map(r => r.recordId))
                        .execute())
                    const topicIdsList = unique(topicVotes.map(t => t.topicId))

                    if (!reprocess) await updateTopicsCurrentVersionBatch(this.ctx, trx, topicIdsList)

                    return {topicIdsList, topicVotes}
                } else {
                    return {
                        topicVotes: [],
                        topicIdsList: []
                    }
                }
            }
        })

        return pipe(
            Effect.tryPromise({
                try: () => insertReactions,
                catch: () => new InsertRecordError()
            }),
            Effect.tap(res => this.addJobs(res, records)),
            Effect.map(() => records.length)
        )
    }

    addJobs(
        res: {
            topicVotes: { reactionUri: string, uri: string, topicId: string }[]
            topicIdsList: string[]
        } | undefined,
        records: RefAndRecord<ReactionRecord>[]
    ): Effect.Effect<void, AddJobError> {
        const worker = this.ctx.worker
        const ctx = this.ctx
        if(!worker) return Effect.void

        return Effect.gen(function* () {
            const reposts = records
                .map(r => r.ref.uri)
                .filter(uri => isRepost(getCollectionFromUri(uri)))
            if(reposts.length > 0){
                yield* worker.addJob("update-following-feed-on-new-content",  reposts)
            }

            if (res) {
                const data: NotificationJobData[] = res.topicVotes.map(t => ({
                    type: "TopicVersionVote",
                    uri: t.reactionUri,
                    subjectId: t.uri,
                    topic: t.topicId
                }))
                if(data.length > 0){
                    yield* worker.addJob("batch-create-notifications", data)
                }
                if(res.topicIdsList.length > 0){
                    yield* addUpdateContributionsJobForTopics(ctx, res.topicIdsList)
                }
            }

            const likeAndRepostsSubjects = records
                .filter(isLikeOrRepost)
                .map(r => r.record.subject.uri)

            if (likeAndRepostsSubjects.length > 0) {
                yield* worker.addJob(
                    "update-interactions-score",
                    likeAndRepostsSubjects
                )
            }
        })
    }

    async batchIncrementReactionCounter(
        trx: Transaction<DB>,
        type: ReactionType,
        recordIds: string[]
    ) {
        const column = columnMap[type]

        if (!column) {
            throw new Error(`Unknown reaction type: ${type}`)
        }

        if (recordIds.length == 0) return

        await trx
            .updateTable('Record')
            .where('uri', 'in', recordIds)
            .set((eb) => ({
                [column]: eb(eb.ref(column), '+', 1)
            }))
            .execute()
    }
}


export class LikeRecordProcessor extends ReactionRecordProcessor {
    validateRecord = AppBskyFeedLike.validateRecord
}


export class RepostRecordProcessor extends ReactionRecordProcessor {
    validateRecord = AppBskyFeedRepost.validateRecord
}


export class VoteAcceptRecordProcessor extends ReactionRecordProcessor {
    validateRecord = ArCabildoabiertoWikiVoteAccept.validateRecord
}


export class VoteRejectRecordProcessor extends ReactionRecordProcessor {
    validateRecord = ArCabildoabiertoWikiVoteReject.validateRecord
}


export class ReactionDeleteProcessor extends DeleteProcessor {
    async deleteRecordsFromDB(uris: string[]) {
        if (uris.length == 0) return
        const type = getCollectionFromUri(uris[0])
        if (!isReactionCollection(type)) return

        const {topicIds, subjectIds} = await this.ctx.kysely.transaction().execute(async (db) => {
            let subjectIds: { subjectId: string, uri: string }[] = []
            try {
                subjectIds = (await db
                    .selectFrom("Reaction")
                    .select(["subjectId", "uri"])
                    .where("uri", "in", uris)
                    .execute())
                    .map(e => e.subjectId != null ? {...e, subjectId: e.subjectId} : null)
                    .filter(x => x != null)
            } catch (err) {
                this.ctx.logger.pino.error({error: err, subjectIds}, "error getting subject ids")
            }

            if (subjectIds.length == 0) {
                this.ctx.logger.pino.info("got no subject ids")
            }

            if (subjectIds.length > 0) {
                try {
                    const deletedSubjects = await db
                        .deleteFrom("HasReacted")
                        .where("reactionType", "=", type)
                        .where(({eb, refTuple, tuple}) =>
                            eb(
                                refTuple("HasReacted.recordId", 'HasReacted.userId'),
                                'in',
                                subjectIds.map(e => tuple(e.subjectId, getDidFromUri(e.uri)))
                            )
                        )
                        .returning(["HasReacted.recordId"])
                        .execute()

                    await this.batchDecrementReactionCounter(db, type, deletedSubjects.map(u => u.recordId))
                } catch (error) {
                    this.ctx.logger.pino.error({error}, "error deleting from has reacted")
                }
            }


            if (type == "ar.cabildoabierto.wiki.voteReject") {
                await db
                    .deleteFrom("VoteReject")
                    .where("uri", "in", uris)
                    .execute()
            }

            await db.deleteFrom("FollowingFeedIndex")
                .where("contentId", "in", uris).execute()

            await db.deleteFrom("TopicInteraction").where("recordId", "in", uris).execute()

            await db.deleteFrom("Notification").where("causedByRecordId", "in", uris).execute()

            await db.deleteFrom("Reaction").where("uri", "in", uris).execute()

            await db.deleteFrom("Record").where("uri", "in", uris).execute()

            if (subjectIds.length > 0 && (type == "ar.cabildoabierto.wiki.voteReject" || type == "ar.cabildoabierto.wiki.voteAccept")) {
                let topicIds: string[] = []
                try {
                    topicIds = (await db
                        .selectFrom("TopicVersion")
                        .select("topicId")
                        .where("uri", "in", subjectIds.map(s => s.subjectId))
                        .execute()).map(t => t.topicId)
                } catch (error) {
                    this.ctx.logger.pino.error({error}, "error getting topic ids")
                }

                if (topicIds.length > 0) {
                    await updateTopicsCurrentVersionBatch(this.ctx, db, topicIds)
                    return {topicIds, subjectIds}
                }
            }
            return {subjectIds}
        })
        if (topicIds && topicIds.length > 0) {
            await addUpdateContributionsJobForTopics(this.ctx, topicIds)
        }
        if (subjectIds && subjectIds.length > 0) {
            const postsAndArticles = subjectIds
                .filter(s => {
                    const c = getCollectionFromUri(s.uri)
                    return c == "app.bsky.feed.post" || c == "ar.cabildoabierto.feed.article"
                })
            await this.ctx.worker?.addJob(
                "update-interactions-score",
                postsAndArticles
            )

            const reposts = subjectIds.filter(r => isRepost(getCollectionFromUri(r.uri)))
            if (reposts.length > 0) {
                this.ctx.logger.pino.info({reposts}, "updating following feed after reposts deleted")
                await this.ctx.worker?.addJob("update-following-feed-on-deleted-content", reposts.map(r => r.subjectId))
            }
        }
    }

    async batchDecrementReactionCounter(
        trx: Transaction<DB>,
        type: ReactionType,
        recordIds: string[]
    ) {
        const column = columnMap[type]

        if (!column) {
            throw new Error(`Unknown reaction type: ${type}`)
        }

        if (recordIds.length == 0) return

        await trx
            .updateTable('Record')
            .where('uri', 'in', recordIds)
            .set((eb) => ({
                [column]: eb(eb.ref(column), '-', 1)
            }))
            .execute()
    }
}


export function isReactionType(collection: string): collection is ReactionType {
    return [
        "app.bsky.feed.like",
        "app.bsky.feed.repost",
        "ar.cabildoabierto.wiki.voteAccept",
        "ar.cabildoabierto.wiki.voteReject"
    ].includes(collection)
}