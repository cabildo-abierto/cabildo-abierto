import {unique} from "@cabildo-abierto/utils"
import {ArCabildoabiertoWikiTopic} from "@cabildo-abierto/api"
import {getUri} from "@cabildo-abierto/utils"
import {CAHandlerNoAuth} from "#/utils/handler.js"
import {getTopicCategories, getTopicTitle} from "#/services/wiki/utils.js"
import {AppContext} from "#/setup.js"
import {DB} from "../../../prisma/generated/types.js"
import {Transaction} from "kysely"
import {jsonArrayFrom} from "kysely/helpers/postgres"
import {Effect} from "effect";
import {NotFoundError} from "#/services/dataset/read.js";
import {DBSelectError} from "#/utils/errors.js";


export function getTopicIdFromTopicVersionUri(ctx: AppContext, did: string, rkey: string): Effect.Effect<string, NotFoundError | DBSelectError> {
    const uris = [getUri(did, "ar.com.cabildoabierto.topic", rkey), getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey)]

    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("TopicVersion")
            .select("topicId")
            .where("uri", "in", uris)
            .executeTakeFirst(),
        catch: (error) => new DBSelectError(error)
    }).pipe(Effect.flatMap(res => {
        return res ? Effect.succeed(res?.topicId) : Effect.fail(new NotFoundError())
    }))
}


// TO DO: Estaría bueno cachear esto...
export const getTopicTitleHandler: CAHandlerNoAuth<{ params: { id: string } }, {
    title: string
}> = async (ctx, agent, {params}) => {
    const topic = await ctx.kysely
        .selectFrom("Topic")
        .innerJoin("TopicVersion", "TopicVersion.uri", "Topic.currentVersionId")
        .select([
            "id",
            "props"
        ])
        .where("id", "=", params.id)
        .executeTakeFirst()

    if (!topic) {
        return {error: "No se encontró el tema"}
    }
    const title = getTopicTitle({props: topic.props as ArCabildoabiertoWikiTopic.TopicProp[] | undefined})
    if(!title) return {error: "El tema no tiene título."}
    return {
        data: {
            title
        }
    }
}


export async function updateTopicsCurrentVersionBatch(ctx: AppContext, trx: Transaction<DB> | AppContext["kysely"], topicIds: string[]) {
    topicIds = unique(topicIds)
    if (topicIds.length == 0) return

    type VersionWithVotes = {
        topicId: string
        uri: string
        reactions?: { uri: string | null }[]
        currentVersionId: string | null
        createdAt: Date | null
        props: unknown
    }

    let allVersions: VersionWithVotes[]

    try {
        allVersions = await trx
            .selectFrom('Record')
            .innerJoin('TopicVersion', 'TopicVersion.uri', 'Record.uri')
            .innerJoin("User", "Record.authorId", "User.did")
            .innerJoin("Topic", "Topic.id", "TopicVersion.topicId")
            .select([
                "Record.createdAt",
                'TopicVersion.topicId',
                "Topic.currentVersionId",
                'Record.uri',
                "TopicVersion.props",
                eb => jsonArrayFrom(eb
                    .selectFrom("Reaction")
                    .whereRef("Reaction.subjectId", "=", "TopicVersion.uri")
                    .innerJoin("Record as ReactionRecord", "ReactionRecord.uri", "Reaction.uri")
                    .innerJoin("User as ReactionAuthor", "ReactionAuthor.did", "ReactionRecord.authorId")
                    .select([
                        "Reaction.uri"
                    ])
                    .orderBy("ReactionRecord.authorId")
                    .orderBy("ReactionRecord.createdAt desc")
                    .distinctOn("ReactionRecord.authorId")
                ).as("reactions")
            ])
            .where('TopicVersion.topicId', 'in', topicIds)
            .where('Record.cid', 'is not', null)
            .orderBy('Record.createdAt', 'asc')
            .execute()
    } catch (err) {
        ctx.logger.pino.error({error: err}, "Error getting topics for update current version")
        return
    }

    const versionsByTopic = new Map<string, VersionWithVotes[]>()
    allVersions.forEach(version => {
        versionsByTopic.set(version.topicId, [...versionsByTopic.get(version.topicId) ?? [], version])
    })

    const categoryUpdates: {id: string, categories: string[]}[] = []

    let lastEdit = new Date()
    let updates: {
        id: string
        currentVersionId: string | null
        lastEdit: Date
    }[] = []
    for (let i = 0; i < topicIds.length; i++) {
        const id = topicIds[i]
        const versions = versionsByTopic.get(id)
        ctx.logger.pino.info({id, versions}, "topic versions")
        if (!versions) continue

        if (versions.length == 0) {
            updates.push({
                id,
                currentVersionId: null,
                lastEdit
            })
        } else {
            const currentVersion = versions[0] // TO DO

            if (currentVersion == null) {
                updates.push({
                    id,
                    currentVersionId: null,
                    lastEdit
                })
            } else {
                const newCurrentVersion = currentVersion.uri
                const currentCurrentVersion = versions[0].currentVersionId

                if (newCurrentVersion != currentCurrentVersion) {
                    updates.push({
                        id,
                        currentVersionId: newCurrentVersion,
                        lastEdit
                    })
                    categoryUpdates.push({
                        id,
                        categories: getTopicCategories(currentVersion.props as ArCabildoabiertoWikiTopic.TopicProp[])
                    })
                }
            }
        }
    }

    if (updates.length > 0) {
        try {
            await trx
                .insertInto("Topic")
                .values(updates.map(u => ({...u, synonyms: [], lastEdit_tz: u.lastEdit})))
                .onConflict((oc) =>
                    oc.column("id").doUpdateSet({
                        currentVersionId: (eb) => eb.ref('excluded.currentVersionId')
                    })
                )
                .execute()
        } catch (err) {
            ctx.logger.pino.error({error: err}, "Error updating topics current version")
        }
    }

    if(categoryUpdates.length > 0) {
        try {
            const newCategories = categoryUpdates.flatMap(u => u.categories)
            if(newCategories.length > 0){
                await trx
                    .insertInto("TopicCategory")
                    .values(newCategories.map(u => ({id: u})))
                    .onConflict(
                        oc => oc
                            .column("id").doNothing())
                    .execute()
            }
            const values: {topicId: string, categoryId: string}[] = []
            categoryUpdates.forEach(c => {
                values.push(...c.categories.map(cat => ({topicId: c.id, categoryId: cat})))
            })
            await trx.deleteFrom("TopicToCategory")
                .where("topicId", "in", categoryUpdates.map(v => v.id))
                .execute()
            if(values.length > 0) {
                await trx
                    .insertInto("TopicToCategory")
                    .values(values)
                    .onConflict(oc => oc.columns(["topicId", "categoryId"]).doNothing())
                    .execute()
            }
        } catch (err) {
            ctx.logger.pino.error({error: err}, "Error updating categories with new topic current version")
        }
    }
}

export async function updateAllTopicsCurrentVersions(ctx: AppContext) {
    const topics = await ctx.kysely.selectFrom("Topic").select("id").execute()

    const batchSize = 500

    for (let i = 0; i < topics.length; i += batchSize) {
        ctx.logger.pino.info({i, total: topics.length, batchSize}, "Updating all topics current version")
        await ctx.kysely.transaction().execute(async trx => {
            await updateTopicsCurrentVersionBatch(
                ctx,
                trx,
                topics.slice(i, i + batchSize).map(x => x.id)
            )
        })
    }
}