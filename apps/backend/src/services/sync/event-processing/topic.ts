import {AppContext} from "#/setup.js";
import { ATProtoStrongRef } from "#/lib/types.js";
import {RefAndRecord, SyncContentProps} from "#/services/sync/types.js";
import {getDidFromUri} from "@cabildo-abierto/utils";
import {processContentsBatch} from "#/services/sync/event-processing/content.js";
import {ExpressionBuilder, OnConflictDatabase, OnConflictTables, sql} from "kysely";
import {DB} from "../../../../prisma/generated/types.js";
import {NotificationJobData} from "#/services/notifications/notifications.js";
import {getCidFromBlobRef} from "#/services/sync/utils.js";
import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"
import {
    RecordProcessor
} from "#/services/sync/event-processing/record-processor.js";
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {unique} from "@cabildo-abierto/utils";
import {updateTopicsCurrentVersionBatch} from "#/services/wiki/current-version.js";


export class TopicVersionRecordProcessor extends RecordProcessor<ArCabildoabiertoWikiTopicVersion.Record> {

    validateRecord = ArCabildoabiertoWikiTopicVersion.validateRecord

    async addRecordsToDB(records: RefAndRecord<ArCabildoabiertoWikiTopicVersion.Record>[], reprocess: boolean = false) {
        const contents: { ref: ATProtoStrongRef, record: SyncContentProps }[] = records.map(r => ({
            record: {
                format: r.record.format,
                textBlob: r.record.text ? {
                    cid: getCidFromBlobRef(r.record.text),
                    authorId: getDidFromUri(r.ref.uri)
                } : undefined,
                embeds: r.record.embeds ?? []
            },
            ref: r.ref
        }))

        const topics = getUniqueTopicUpdates(records)

        const topicVersions = records.map(r => ({
            uri: r.ref.uri,
            topicId: r.record.id,
            message: r.record.message ? r.record.message : undefined,
            props: r.record.props ? JSON.stringify(r.record.props) : undefined,
            authorship: r.record.claimsAuthorship ?? false
        }))

        const inserted = await this.ctx.kysely.transaction().execute(async (trx) => {
            await this.processRecordsBatch(trx, records)
            await processContentsBatch(this.ctx, trx, contents)

            try {
                await trx
                    .insertInto("Topic")
                    .values(topics.map(t => ({...t, synonyms: []})))
                    .onConflict((oc) => oc.column("id").doUpdateSet({
                        lastEdit: sql`GREATEST
                    ("Topic"."lastEdit", excluded."lastEdit")`
                    }))
                    .execute()
            } catch (err) {
                this.ctx.logger.pino.error({error: err}, "Error processing topics")
            }

            try {
                if(topicVersions.length > 0){
                    const inserted = await trx
                        .insertInto("TopicVersion")
                        .values(topicVersions)
                        .onConflict(oc => oc.column("uri").doUpdateSet({
                            topicId: eb => eb.ref("excluded.topicId"),
                            message: (eb) => eb.ref("excluded.message"),
                            props: (eb: ExpressionBuilder<OnConflictDatabase<DB, "TopicVersion">, OnConflictTables<"TopicVersion">>) => eb.ref("excluded.props")
                        }))
                        .returning(["topicId", "TopicVersion.uri"])
                        .execute()

                    await updateTopicsCurrentVersionBatch(this.ctx, trx, inserted.map(t => t.topicId))

                    return inserted
                } else {
                    return []
                }
            } catch (err) {
                this.ctx.logger.pino.error({error: err}, "error inserting topic versions")
            }
        })

        if(!reprocess){
            await this.createJobs(records, inserted, topics)
        }
    }

    async createJobs(records: RefAndRecord<ArCabildoabiertoWikiTopicVersion.Record>[], inserted: {uri: string, topicId: string}[] | undefined, topics: {id: string}[]) {
        const authors = unique(records.map(r => getDidFromUri(r.ref.uri)))

        if (inserted) {
            const data: NotificationJobData[] = inserted.map((i) => ({
                uri: i.uri,
                topics: i.topicId,
                type: "TopicEdit"
            }))
            this.ctx.worker?.addJob("batch-create-notifications", data)
        }

        await addUpdateContributionsJobForTopics(this.ctx, topics.map(t => t.id))

        await Promise.all([
            this.ctx.worker?.addJob("update-author-status", authors, 11),
            this.ctx.worker?.addJob("update-contents-topic-mentions", records.map(r => r.ref.uri), 11),
            this.ctx.worker?.addJob("update-topic-mentions", topics.map(t=> t.id), 11)
        ])
    }
}


export class TopicVersionDeleteProcessor extends DeleteProcessor {
    async deleteRecordsFromDB(uris: string[]){
        await processDeleteTopicVersionsBatch(this.ctx, uris)
    }
}


function getUniqueTopicUpdates(records: { ref: ATProtoStrongRef, record: ArCabildoabiertoWikiTopicVersion.Record }[]) {
    const topics = new Map<string, { id: string, lastEdit: Date }>()
    records.forEach(r => {
        const id = r.record.id
        const cur = topics.get(id)
        const date = new Date(r.record.createdAt)
        if (!cur) {
            topics.set(id, {id, lastEdit: date})
        } else {
            topics.set(id, {id, lastEdit: cur.lastEdit > date ? cur.lastEdit : date})
        }
    })
    return Array.from(topics.values())
}


export async function addUpdateContributionsJobForTopics(ctx: AppContext, ids: string[]) {
    await ctx.worker?.addJob(
        "update-topic-contributions",
        ids
    )
}


export async function processDeleteTopicVersionsBatch(ctx: AppContext, uris: string[]) {
    await ctx.kysely.transaction().execute(async (trx) => {
        try {
            const topicIds = await trx
                .selectFrom("Topic")
                .innerJoin("TopicVersion", "TopicVersion.topicId", "Topic.id")
                .select(["id"])
                .where("TopicVersion.uri", "in", uris)
                .execute()

            await trx
                .deleteFrom("Notification")
                .where("causedByRecordId", "in", uris)
                .execute()

            await trx
                .deleteFrom("HasReacted")
                .where("recordId", "in", uris)
                .execute()

            await trx
                .deleteFrom("VoteReject")
                .using("Reaction")
                .whereRef("VoteReject.uri", "=", "Reaction.uri")
                .where("Reaction.subjectId", "in", uris)
                .execute()

            await trx
                .deleteFrom("Reaction")
                .where("subjectId", "in", uris)
                .execute()

            await trx
                .deleteFrom("Reference")
                .where("referencingContentId", "in", uris)
                .execute()

            await trx
                .deleteFrom("AssignedPayment")
                .where("AssignedPayment.contentId", "in", uris)
                .execute()

            await trx
                .deleteFrom("TopicVersion")
                .where("uri", "in", uris)
                .execute()

            await trx
                .deleteFrom("Content")
                .where("uri", "in", uris)
                .execute()

            await trx
                .deleteFrom("Record")
                .where("uri", "in", uris)
                .execute()

            await updateTopicsCurrentVersionBatch(ctx, trx, topicIds.map(t => t.id))
            await ctx.worker?.addJob("update-contents-topic-mentions", uris)
            await ctx.worker?.addJob("update-topic-mentions", topicIds.map(t => t.id))
        } catch (err) {
            console.log(err)
            console.log("Error deleting topic versions")
            return
        }

    })
}