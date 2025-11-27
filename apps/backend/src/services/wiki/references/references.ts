import {AppContext} from "#/setup.js";
import {getCAUsersDids} from "#/services/user/users.js";
import {sql} from "kysely";
import {v4 as uuidv4} from "uuid";
import {
    getEditedTopics,
    updateTopicInteractionsOnNewReactions,
    updateTopicInteractionsOnNewReferences,
    updateTopicInteractionsOnNewReplies
} from "#/services/wiki/references/interactions.js";
import {updateTopicPopularities} from "#/services/wiki/references/popularity.js";
import {updateContentsText} from "#/services/wiki/content.js";
import {getTimestamp, updateTimestamp} from "#/services/admin/status.js";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"
import {getTopicCategories, getTopicTitle} from "#/services/wiki/utils.js";
import {getCollectionFromUri, isArticle, isTopicVersion} from "@cabildo-abierto/utils";
import {isReactionCollection} from "#/utils/type-utils.js";
import {anyEditorStateToMarkdownOrLexical} from "#/utils/lexical/transforms.js";
import {NotificationJobData} from "#/services/notifications/notifications.js";
import {jsonArrayFrom} from "kysely/helpers/postgres";
import {unique} from "@cabildo-abierto/utils";

export async function updateReferencesForNewContents(ctx: AppContext) {
    const lastUpdate = await getLastReferencesUpdate(ctx)
    ctx.logger.pino.info({lastUpdate}, "updating references for new contents")

    const batchSize = 500
    let curOffset = 0

    const caUsers = await getCAUsersDids(ctx)

    while (true) {
        const contents: { uri: string }[] = await ctx.kysely
            .selectFrom('Record')
            .select([
                'Record.uri',
            ])
            .innerJoin("Content", "Content.uri", "Record.uri")
            .where("Content.text", "is not", null)
            .where('Record.CAIndexedAt', '>=', lastUpdate)
            .where("Record.authorId", "in", caUsers)
            .orderBy('Record.CAIndexedAt', 'asc')
            .limit(batchSize)
            .offset(curOffset)
            .execute()

        if (contents.length == 0) break
        curOffset += contents.length
        ctx.logger.pino.info({count: contents.length, curOffset}, "updating references for new contents batch")
        const t1 = Date.now()
        await updateReferencesForContentsAndTopics(
            ctx,
            contents.map(c => c.uri),
            undefined
        )
        const t2 = Date.now()
        ctx.logger.logTimes("updating references for new contents batch", [t1, t2])
    }
}


async function ftsReferencesQuery(ctx: AppContext, uris?: string[], topics?: string[]) {
    try {
        if (uris != undefined && uris.length == 0 || topics != undefined && topics.length == 0) return []
        return await ctx.kysely
            .with(wb => wb("Synonyms").materialized(), eb => eb
                .selectFrom(
                    (eb) => eb.selectFrom("Topic")
                        .$if(topics != null, qb => qb.where("Topic.id", "in", topics!))
                        .select([
                            "Topic.id",
                            sql<string>`unnest
                            ("Topic"."synonyms")`.as("keyword")
                        ])
                        .as("UnnestedSynonyms")
                )
                .select([
                    "UnnestedSynonyms.id",
                    sql`websearch_to_tsquery
                    ('public.spanish_simple_unaccent', "UnnestedSynonyms"."keyword")`.as("query")
                ])
            )
            .selectFrom("Content")
            .innerJoin("Synonyms", (join) =>
                join.on(sql`"Content"."text_tsv" @@ "Synonyms"."query"`)
            )
            .$if(uris != null, qb => qb.where("Content.uri", "in", uris!))
            .innerJoin("Record", "Record.uri", "Content.uri")
            .innerJoin("User", "User.did", "Record.authorId")
            .where("User.inCA", "=", true)
            .where("Synonyms.query", "is not", null)
            .select([
                "Synonyms.id",
                "Content.uri",
                sql<number>`ts_rank_cd
                ("Content"."text_tsv", "Synonyms"."query")`.as("rank")
            ])
            .execute()
    } catch (error) {
        ctx.logger.pino.error({
            error,
            topics: topics?.slice(0, 5),
            uris: uris?.slice(0, 5)
        }, "error in ftsReferences query")
        throw error
    }
}


export async function getReferencesToInsert(ctx: AppContext, uris?: string[], topics?: string[]) {
    if (!topics && !uris) throw Error("Obtener las referencias para todos los contenidos y temas es muy caro!")

    const matches = await ftsReferencesQuery(ctx, uris, topics)

    // entre cada par (tema, contenido) almacenamos a lo sumo una referencia
    const refsMap = new Map<string, ReferenceToInsert>()

    for (const m of matches) {
        const key = `${m.uri}:${m.id}`
        const cur = refsMap.get(key)
        if (!cur || !cur.relevance || cur.relevance < m.rank) {
            refsMap.set(key, {
                id: uuidv4(),
                referencedTopicId: m.id,
                referencingContentId: m.uri,
                type: "Weak",
                relevance: m.rank
            })
        }
    }

    return Array.from(refsMap.values())
}


async function updateReferencesForContentsAndTopics(ctx: AppContext, contents?: string[], topics?: string[]): Promise<string[]> {
    if (!topics && !contents) throw Error("Obtener las referencias para todos los contenidos y temas es muy caro!")
    const topicBs = 10
    const contentsBs = 500
    if (!contents && topics && topics.length > topicBs) {
        const newReferences: string[] = []
        for (let i = 0; i < topics.length; i += topicBs) {
            newReferences.push(...await updateReferencesForContentsAndTopics(ctx, contents, topics.slice(i, i + topicBs)))
        }
        return newReferences
    } else if (!topics && contents && contents.length > contentsBs) {
        const newReferences: string[] = []
        for (let i = 0; i < contents.length; i += contentsBs) {
            newReferences.push(...await updateReferencesForContentsAndTopics(ctx, contents.slice(i, i + contentsBs), topics))
        }
        return newReferences
    } else {
        const referencesToInsert = await getReferencesToInsert(ctx, contents, topics)
        await applyReferencesUpdate(
            ctx,
            referencesToInsert,
            contents,
            topics
        )
        return referencesToInsert.map(r => r.id)
    }
}


export type ReferenceToInsert = {
    id: string
    type: "Strong" | "Weak"
    count?: number
    relevance?: number
    referencedTopicId: string
    referencingContentId: string
}


async function applyReferencesUpdate(ctx: AppContext, referencesToInsert: ReferenceToInsert[], contentUris?: string[], topicIds?: string[]) {
    // asumimos que referencesToInsert tiene todas las referencias en el producto cartesiano
    // entre contentIds y topicIds
    // si contentIds es undefined son todos los contenidos y lo mismo con topicIds
    if (contentUris != null && contentUris.length == 0 || topicIds != null && topicIds.length == 0) return

    try {
        const date = new Date()
        ctx.logger.pino.info(
            {count: referencesToInsert.length},
            "applying references update"
        )

        await ctx.kysely.transaction().execute(async trx => {
            if (referencesToInsert.length > 0) {
                await trx
                    .insertInto("Reference")
                    .values(referencesToInsert
                        .map(r => ({...r, touched_tz: date})))
                    .onConflict(oc => oc.columns(["referencingContentId", "referencedTopicId"]).doUpdateSet(eb => ({
                        touched_tz: eb.ref("excluded.touched_tz"),
                        relevance: eb.ref("excluded.relevance")
                    })))
                    .execute()
            }
            await trx
                .deleteFrom("Reference")
                .where("touched_tz", "<", date)
                .$if(
                    contentUris != null,
                    qb => qb.where("Reference.referencingContentId", "in", contentUris!))
                .$if(
                    topicIds != null,
                    qb => qb.where("Reference.referencedTopicId", "in", topicIds!))
                .execute()
        })
    } catch (e) {
        ctx.logger.pino.error({error: e}, "error applying references update")
        throw e
    }
}

export type TextAndFormat = { text: string, format: string | null }

export async function getLastReferencesUpdate(ctx: AppContext) {
    return (await getTimestamp(ctx, "last-references-update")) ?? new Date(0)
}


export async function setLastReferencesUpdate(ctx: AppContext, date: Date) {
    ctx.logger.pino.info({date}, "setting last references update")
    await updateTimestamp(ctx, "last-references-update", date)
}


export async function updateReferencesForNewTopics(ctx: AppContext) {
    const lastUpdate = await getLastReferencesUpdate(ctx)

    ctx.logger.pino.info({lastUpdate}, "updating references for new topics")
    const topicIds = await getEditedTopics(ctx, lastUpdate)

    ctx.logger.pino.info({count: topicIds.length, head: topicIds.slice(0, 5)}, "edited topics")

    if (topicIds.length == 0) {
        return
    }

    const bs = 10
    for (let i = 0; i < topicIds.length; i += bs) {
        ctx.logger.pino.info({newTopics: topicIds.length, bs}, "updating references for new topics batch")
        const t1 = Date.now()
        await updateReferencesForContentsAndTopics(ctx, undefined, topicIds.slice(i, i + bs))
        const t2 = Date.now()
        ctx.logger.logTimes("updating references for new topics batch", [t1, t2])
    }
}


export async function updateReferences(ctx: AppContext) {
    const updateTime = new Date()

    await updateReferencesForNewContents(ctx)
    await updateReferencesForNewTopics(ctx)

    await setLastReferencesUpdate(ctx, updateTime)
}


export async function cleanNotCAReferences(ctx: AppContext) {
    const caUsers = await getCAUsersDids(ctx)

    await ctx.kysely
        .deleteFrom("Reference")
        .innerJoin("Record", "Reference.referencingContentId", "Record.uri")
        .where("Record.authorId", "not in", caUsers)
        .execute()
}


export async function updatePopularitiesOnTopicsChange(ctx: AppContext, topicIds: string[]) {
    const t1 = Date.now()
    await updateContentsText(ctx)
    const t2 = Date.now()
    const newReferences = await updateReferencesForContentsAndTopics(ctx, undefined, topicIds)
    const t3 = Date.now()
    await updateTopicInteractionsOnNewReferences(ctx, newReferences)
    const t4 = Date.now()
    await updateTopicPopularities(ctx, topicIds)
    const t5 = Date.now()

    await updateContentCategoriesOnTopicsChange(ctx, topicIds)

    ctx.logger.logTimes(`update refs and pops on ${topicIds.length} topics`, [t1, t2, t3, t4, t5])
}


export function findMentionsInText(text: string) {
    const mentionRegex = /\[@([a-zA-Z0-9.-]+)\]\(\/perfil\/\1\)/g
    const matches = text.matchAll(mentionRegex)
    const mentions = new Set<string>()
    for (const match of matches) {
        mentions.add(match[1])
    }
    return Array.from(mentions)
}


async function createMentionNotifications(ctx: AppContext, uris: string[]) {
    const filteredUris = uris.filter(u => {
        const c = getCollectionFromUri(u)
        return isArticle(c) || isTopicVersion(c)
    })

    if (filteredUris.length == 0) return

    const texts = await ctx.kysely
        .selectFrom("Content")
        .where("Content.uri", "in", filteredUris)
        .select(["Content.text", "Content.dbFormat", "Content.uri"])
        .execute()

    const data: NotificationJobData[] = []
    for (let i = 0; i < texts.length; i++) {
        const res = anyEditorStateToMarkdownOrLexical(texts[i].text, texts[i].dbFormat)
        if (res.format == "markdown") {
            const mentions = findMentionsInText(res.text)
            ctx.logger.pino.info({...texts[i], mentions: Array.from(mentions)}, "looking for mentions in text")
            for (const m of mentions) {
                data.push({
                    type: "Mention",
                    uri: texts[i].uri,
                    handle: m
                })
            }
        } else {
            ctx.logger.pino.error({
                    uri: texts[i].uri
                }, "couldn't create mention notifications because text is not markdown"
            )
        }
    }
    if (data.length > 0) {
        ctx.worker?.addJob("batch-create-notifications", data)
    }
}


export async function updatePopularitiesOnContentsChange(ctx: AppContext, uris: string[]) {
    const t1 = Date.now()
    await updateContentsText(ctx, uris)
    const t2 = Date.now()
    const newReferences = await updateReferencesForContentsAndTopics(
        ctx,
        uris,
        undefined
    )
    const t3 = Date.now()
    const topicsWithNewInteractions = await updateTopicInteractionsOnNewReferences(
        ctx,
        newReferences
    )
    const t4 = Date.now()
    topicsWithNewInteractions.push(...await updateTopicInteractionsOnNewReplies(
        ctx,
        uris
    ))
    const t5 = Date.now()
    await updateTopicPopularities(
        ctx,
        topicsWithNewInteractions
    )
    const t6 = Date.now()

    await createMentionNotifications(
        ctx,
        uris
    )
    const t7 = Date.now()

    await updateDiscoverFeedIndex(
        ctx,
        uris
    )
    const t8 = Date.now()

    ctx.logger.logTimes(`update refs and pops on ${uris.length} contents`, [t1, t2, t3, t4, t5, t6, t7, t8])
}


export async function updatePopularitiesOnNewReactions(ctx: AppContext, uris: string[]) {
    uris = uris.filter(r => isReactionCollection(getCollectionFromUri(r)))
    if (uris.length == 0) return

    const t1 = Date.now()
    const topicsWithNewInteractions = await updateTopicInteractionsOnNewReactions(ctx, uris)
    const t2 = Date.now()

    await updateTopicPopularities(ctx, topicsWithNewInteractions)
    const t3 = Date.now()

    ctx.logger.logTimes("update-popularities-on-new-reactions", [t1, t2, t3])
}


export async function recreateAllReferences(ctx: AppContext, since: Date = new Date(0)) {
    const current = await getLastReferencesUpdate(ctx)
    ctx.logger.pino.info({current}, "last references update was")
    await updateContentsText(ctx)
    await setLastReferencesUpdate(ctx, since)
    const startDate = new Date()
    await updateReferencesForNewContents(ctx)
    await setLastReferencesUpdate(ctx, startDate)
}


export async function recomputeTopicInteractionsAndPopularities(ctx: AppContext, since: Date = new Date(0)) {
    let offset = 0
    const bs = 2000

    while (true) {
        const t1 = Date.now()
        const references = await ctx.kysely
            .selectFrom("Reference")
            .innerJoin("Record", "Record.uri", "Reference.referencingContentId")
            .select(["id", "referencedTopicId"])
            .limit(bs)
            .offset(offset)
            .where("Record.created_at", ">", since)
            .execute()
        const t2 = Date.now()
        if (references.length == 0) break

        await updateTopicInteractionsOnNewReferences(ctx, references.map(r => r.id))
        const t3 = Date.now()
        const topics = references.map(r => r.referencedTopicId)
        await updateTopicPopularities(ctx, topics)
        const t4 = Date.now()

        ctx.logger.logTimes("recomputing topic interactions and popularities batch", [t1, t2, t3, t4], {offset})
        offset += bs
        if (references.length < bs) break
    }
}


export async function getTopicsReferencedInText(ctx: AppContext, text: string): Promise<ArCabildoabiertoFeedDefs.TopicMention[]> {
    if (!text.trim()) return []

    const text_tsv = sql`to_tsvector('public.spanish_simple_unaccent', ${text})`;

    const matches = await ctx.kysely
        .with("Synonyms", eb => eb
            .selectFrom("Topic")
            .select(["id", "currentVersionId", sql<string>`unnest("Topic"."synonyms")`.as("keyword")])
        )
        .selectFrom("Synonyms")
        .where(sql<boolean>`
          ${text_tsv} @@ websearch_to_tsquery('public.spanish_simple_unaccent', "Synonyms"."keyword")
        `)
        .innerJoin("TopicVersion", "TopicVersion.uri", "Synonyms.currentVersionId")
        .select([
            'Synonyms.id as topicId',
            'Synonyms.keyword',
            "TopicVersion.props",
            sql<number>`ts_rank_cd(${text_tsv}, websearch_to_tsquery('public.spanish_simple_unaccent',"Synonyms"."keyword"))`.as('rank')
        ])
        .execute()

    const topicsMap = new Map<string, ArCabildoabiertoFeedDefs.TopicMention>()
    for (const match of matches) {
        const existing = topicsMap.get(match.topicId)

        if (!existing || match.rank > existing.count) {
            topicsMap.set(match.topicId, {
                id: match.topicId,
                count: match.rank,
                title: getTopicTitle({
                    id: match.topicId,
                    props: match.props as ArCabildoabiertoWikiTopicVersion.TopicProp[]
                }),
            })
        }
    }

    return Array.from(topicsMap.values())
        .sort((a, b) => b.count - a.count)
}


export async function updateDiscoverFeedIndex(ctx: AppContext, uris?: string[]) {
    const batchSize = 2000
    let offset = 0

    if(uris != null && uris.length == 0) return

    while (true) {
        try {
            const contents = await ctx.kysely
                .selectFrom("Content")
                .innerJoin("Record", "Record.uri", "Content.uri")
                .where("Record.collection", "in", ["ar.cabildoabierto.feed.article", "app.bsky.feed.post"])
                .$if(uris != null, qb => qb.where("Content.uri", "in", uris!))
                .$if(uris == null, qb => qb.limit(batchSize))
                .$if(uris == null, qb => qb.offset(offset))
                .select([
                    "Content.uri",
                    "Record.created_at_tz",
                    eb => jsonArrayFrom(eb
                        .selectFrom("Reference")
                        .innerJoin("Topic", "Topic.id", "Reference.referencedTopicId")
                        .innerJoin("TopicVersion", "TopicVersion.uri", "Topic.currentVersionId")
                        .whereRef("Reference.referencingContentId", "=", "Content.uri")
                        .select(["TopicVersion.props"])
                    ).as("mentionedTopicsProps")
                ])
                .orderBy("Record.created_at_tz desc")
                .execute()

            if (contents.length == 0) break

            const values: { categoryId: string, contentId: string, created_at: Date }[] = []
            for (const c of contents) {
                const cats = unique(c.mentionedTopicsProps.flatMap(p => {
                    return getTopicCategories(p.props as ArCabildoabiertoWikiTopicVersion.TopicProp[])
                }))
                for (const cat of cats) {
                    if (c.created_at_tz) {
                        values.push({
                            categoryId: cat,
                            contentId: c.uri,
                            created_at: c.created_at_tz
                        })
                    } else {
                        ctx.logger.pino.warn({uri: c.uri}, "content has no created at tz")
                    }
                }
            }

            if (values.length > 0) {
                await ctx.kysely.transaction().execute(async trx => {
                    await trx
                        .deleteFrom("DiscoverFeedIndex")
                        .where("contentId", "in", unique(values.map(v => v.contentId)))
                        .execute()

                    await trx
                        .insertInto("DiscoverFeedIndex")
                        .values(values)
                        .execute()
                })
            }

            offset += batchSize
            if (contents.length < batchSize || uris != null) {
                break
            }
        } catch (error) {
            ctx.logger.pino.error({error, offset, batchSize}, "error updating discover feed index")
            throw error
        }
    }
}


/***
 actualizamos las categorías de todos los contenidos que mencionen a algún tema de la lista
 */
export async function updateContentCategoriesOnTopicsChange(ctx: AppContext, topicIds: string[]) {
    const contents = await ctx.kysely.selectFrom("Reference")
        .where("referencedTopicId", "in", topicIds)
        .select("Reference.referencingContentId")
        .execute()

    await updateDiscoverFeedIndex(ctx, contents.map(c => c.referencingContentId))
}