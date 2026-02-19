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
import {updateTopicsCategoriesOnTopicsChange} from "#/services/wiki/categories.js";
import {Effect} from "effect";
import {AddJobError, DBDeleteError, DBInsertError, DBSelectError, InvalidValueError} from "#/utils/errors.js";


export const updateReferencesForNewContents = (
    ctx: AppContext
): Effect.Effect<void, DBSelectError | DBInsertError | InvalidValueError> => Effect.gen(function* () {
    const lastUpdate = yield* getLastReferencesUpdate(ctx)

    const batchSize = 500
    let curOffset = 0

    const caUsers = yield* getCAUsersDids(ctx)

    while (true) {
        const contents: { uri: string }[] = yield* Effect.tryPromise({
            try: () => ctx.kysely
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
                .execute(),
            catch: error => new DBSelectError(error)
        })

        if (contents.length == 0) break
        curOffset += contents.length
        yield* updateReferencesForContentsAndTopics(
            ctx,
            contents.map(c => c.uri),
            undefined
        )
    }
})


const ftsReferencesQuery = (
    ctx: AppContext,
    uris?: string[],
    topics?: string[]
) => Effect.gen(function* () {
    if (uris != undefined && uris.length == 0 || topics != undefined && topics.length == 0) return []

    return yield* Effect.tryPromise({
        try: () => ctx.kysely
            .with(wb => wb("Synonyms").materialized(), eb => eb
                .selectFrom(
                    (eb) => eb.selectFrom("Topic")
                        .$if(topics != null, qb => qb.where("Topic.id", "in", topics!))
                        .select([
                            "Topic.id",
                            sql<string>`unnest("Topic"."synonyms")`.as("keyword")
                        ])
                        .as("UnnestedSynonyms")
                )
                .select([
                    "UnnestedSynonyms.id",
                    sql`websearch_to_tsquery('public.spanish_simple_unaccent', "UnnestedSynonyms"."keyword")`.as("query")
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
                "Record.created_at_tz",
                sql<number>`ts_rank_cd
                    ("Content"."text_tsv", "Synonyms"."query")`.as("rank")
            ])
            .execute(),
        catch: error => new DBSelectError(error)
    })
})


export const getReferencesToInsert = (
    ctx: AppContext,
    uris?: string[],
    topics?: string[]
): Effect.Effect<ReferenceToInsert[], DBSelectError | InvalidValueError> => Effect.gen(function* () {
    if (!topics && !uris) {
        return yield* Effect.fail(new InvalidValueError("Obtener las referencias para todos los contenidos y temas es muy caro!"))
    }

    const matches = yield* ftsReferencesQuery(ctx, uris, topics)

    // entre cada par (tema, contenido) almacenamos a lo sumo una referencia
    const refsMap = new Map<string, ReferenceToInsert>()

    for (const m of matches) {
        const key = `${m.uri}:${m.id}`
        const cur = refsMap.get(key)
        if (!cur || !cur.relevance || cur.relevance < m.rank) {
            if (m.created_at_tz) {
                refsMap.set(key, {
                    id: uuidv4(),
                    referencedTopicId: m.id,
                    referencingContentId: m.uri,
                    type: "Weak",
                    relevance: m.rank,
                    referencingContentCreatedAt: m.created_at_tz
                })
            }
        }
    }

    return Array.from(refsMap.values())
}).pipe(Effect.withSpan("getReferencesToInsert", {attributes: {urisCount: uris?.length ?? -1, topicsCount: topics?.length ?? -1}}))


const updateReferencesForContentsAndTopics = (
    ctx: AppContext,
    contents?: string[],
    topics?: string[]
): Effect.Effect<string[], DBSelectError | DBInsertError | InvalidValueError> => Effect.gen(function* () {
    if (!topics && !contents) {
        return yield* Effect.fail(
            new InvalidValueError("Obtener las referencias para todos los contenidos y temas es muy caro!")
        )
    }
    const topicBs = 10
    const contentsBs = 500
    if (!contents && topics && topics.length > topicBs) {
        const newReferences: string[] = []
        for (let i = 0; i < topics.length; i += topicBs) {
            newReferences.push(...yield* updateReferencesForContentsAndTopics(ctx, contents, topics.slice(i, i + topicBs)))
        }
        return newReferences
    } else if (!topics && contents && contents.length > contentsBs) {
        const newReferences: string[] = []
        for (let i = 0; i < contents.length; i += contentsBs) {
            newReferences.push(...yield* updateReferencesForContentsAndTopics(ctx, contents.slice(i, i + contentsBs), topics))
        }
        return newReferences
    } else {
        const referencesToInsert = yield* getReferencesToInsert(ctx, contents, topics)
        yield* applyReferencesUpdate(
            ctx,
            referencesToInsert,
            contents,
            topics
        )
        return referencesToInsert.map(r => r.id)
    }
}).pipe(Effect.withSpan("updateReferencesForContentsAndTopics", {attributes: {contentsCount: contents?.length ?? -1, topicsCount: topics?.length ?? -1}}))


export type ReferenceToInsert = {
    id: string
    type: "Strong" | "Weak"
    count?: number
    relevance?: number
    referencedTopicId: string
    referencingContentId: string
    referencingContentCreatedAt: Date
}


const applyReferencesUpdate = (
    ctx: AppContext,
    referencesToInsert: ReferenceToInsert[],
    contentUris?: string[],
    topicIds?: string[]
): Effect.Effect<void, DBInsertError> => Effect.gen(function* () {
    // asumimos que referencesToInsert tiene todas las referencias en el producto cartesiano
    // entre contentIds y topicIds
    // si contentIds es undefined son todos los contenidos y lo mismo con topicIds
    if (contentUris != null && contentUris.length == 0 || topicIds != null && topicIds.length == 0) return

    const date = new Date()

    yield* Effect.tryPromise({
        try: () => ctx.kysely.transaction().execute(async trx => {
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
                    qb => qb.where("Reference.referencingContentId", "in", contentUris!)
                )
                .$if(
                    topicIds != null,
                    qb => qb.where("Reference.referencedTopicId", "in", topicIds!)
                )
                .execute()
        }),
        catch: error => new DBInsertError(error)
    })
}).pipe(Effect.withSpan("applyReferencesUpdate", {attributes: {referencesCount: referencesToInsert.length}}))


export type TextAndFormat = { text: string, format: string | null }

export const getLastReferencesUpdate = (ctx: AppContext) => Effect.gen(function* () {
    return (yield* getTimestamp(ctx, "last-references-update")) ?? new Date(0)
})


export const setLastReferencesUpdate = (ctx: AppContext, date: Date) => {
    return updateTimestamp(ctx, "last-references-update", date)
}


export const updateReferencesForNewTopics = (ctx: AppContext) => Effect.gen(function* () {
    const lastUpdate = yield* getLastReferencesUpdate(ctx)

    const topicIds = yield* getEditedTopics(ctx, lastUpdate)

    if (topicIds.length == 0) {
        return
    }

    const bs = 10
    for (let i = 0; i < topicIds.length; i += bs) {
        yield* updateReferencesForContentsAndTopics(ctx, undefined, topicIds.slice(i, i + bs))
    }
})


export const updateReferences = (ctx: AppContext): Effect.Effect<void, DBSelectError | DBInsertError | InvalidValueError> => Effect.gen(function* () {
    const updateTime = new Date()

    yield* updateReferencesForNewContents(ctx)
    yield* updateReferencesForNewTopics(ctx)

    yield* setLastReferencesUpdate(ctx, updateTime)
})


export const updatePopularitiesOnTopicsChange = (
    ctx: AppContext,
    topicIds: string[]
): Effect.Effect<void, DBDeleteError | DBSelectError | DBInsertError | InvalidValueError> => Effect.gen(function* () {
    yield* updateContentsText(ctx)

    const newReferences = yield* updateReferencesForContentsAndTopics(ctx, undefined, topicIds)

    yield* updateTopicInteractionsOnNewReferences(ctx, newReferences)
    yield* updateTopicPopularities(ctx, topicIds)

    yield* updateTopicsCategoriesOnTopicsChange(ctx, topicIds)

    yield* updateContentCategoriesOnTopicsChange(ctx, topicIds)
})


export function findMentionsInText(text: string) {
    const mentionRegex = /\[@([a-zA-Z0-9.-]+)\]\(\/perfil\/\1\)/g
    const matches = text.matchAll(mentionRegex)
    const mentions = new Set<string>()
    for (const match of matches) {
        mentions.add(match[1])
    }
    return Array.from(mentions)
}


const createMentionNotifications = (
    ctx: AppContext,
    uris: string[]
) => Effect.gen(function* () {
    const filteredUris = uris.filter(u => {
        const c = getCollectionFromUri(u)
        return isArticle(c) || isTopicVersion(c)
    })

    if (filteredUris.length == 0) return

    const texts = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Content")
            .where("Content.uri", "in", filteredUris)
            .select(["Content.text", "Content.dbFormat", "Content.uri"])
            .execute(),
        catch: (error) => new DBSelectError(error)
    })

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
        yield* ctx.worker?.addJob("batch-create-notifications", data)
    }
}).pipe(Effect.withSpan("createMentionNotifications", {attributes: {count: uris.length}}))


export const updatePopularitiesOnContentsChange = (
    ctx: AppContext,
    uris: string[]
): Effect.Effect<void, DBInsertError | DBSelectError | AddJobError | InvalidValueError | DBDeleteError> => Effect.gen(function* () {
    yield* updateContentsText(ctx, uris)

    const newReferences = yield* updateReferencesForContentsAndTopics(
        ctx,
        uris,
        undefined
    )
    const topicsWithNewInteractions = yield* updateTopicInteractionsOnNewReferences(
        ctx,
        newReferences
    )
    topicsWithNewInteractions.push(...yield* updateTopicInteractionsOnNewReplies(
        ctx,
        uris
    ))
    yield* updateTopicPopularities(
        ctx,
        topicsWithNewInteractions
    )

    yield* createMentionNotifications(
        ctx,
        uris
    )

    yield* updateDiscoverFeedIndex(
        ctx,
        uris
    )
}).pipe(Effect.withSpan("updatePopularitiesOnContentsChange", {attributes: {count: uris.length}}))


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


export const recreateAllReferences = (
    ctx: AppContext,
    since: Date = new Date(0)
) => Effect.gen(function* () {
    const current = yield* getLastReferencesUpdate(ctx)
    ctx.logger.pino.info({current}, "last references update was")
    yield* updateContentsText(ctx)
    yield* setLastReferencesUpdate(ctx, since)
    const startDate = new Date()
    yield* updateReferencesForNewContents(ctx)
    yield* setLastReferencesUpdate(ctx, startDate)
})


export const recomputeTopicInteractionsAndPopularities = (
    ctx: AppContext,
    since: Date = new Date(0)
) => Effect.gen(function* () {
    let offset = 0
    const bs = 2000

    while (true) {
        const references = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("Reference")
                .innerJoin("Record", "Record.uri", "Reference.referencingContentId")
                .select(["id", "referencedTopicId"])
                .limit(bs)
                .offset(offset)
                .where("Record.created_at", ">", since)
                .execute(),
            catch: (error) => new DBSelectError(error)
        })
        if (references.length == 0) break

        yield* updateTopicInteractionsOnNewReferences(ctx, references.map(r => r.id))
        const topics = references.map(r => r.referencedTopicId)
        yield* updateTopicPopularities(ctx, topics)

        offset += bs
        if (references.length < bs) break
    }
})


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
            sql<number>`ts_rank_cd
            (${text_tsv}, websearch_to_tsquery('public.spanish_simple_unaccent',"Synonyms"."keyword"))`.as('rank')
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


export const updateDiscoverFeedIndex = (
    ctx: AppContext,
    uris?: string[]
) => Effect.gen(function* () {
    const batchSize = 2000
    let offset = 0

    if (uris != null && uris.length == 0) return

    while (true) {
        const contents = yield* Effect.tryPromise({
            try: () => ctx.kysely
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
                .execute(),
            catch: (error) => new DBSelectError(error)
        })

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
            yield* Effect.tryPromise({
                try: () => ctx.kysely.transaction().execute(async trx => {
                    await trx
                        .deleteFrom("DiscoverFeedIndex")
                        .where("contentId", "in", unique(values.map(v => v.contentId)))
                        .execute()

                    await trx
                        .insertInto("DiscoverFeedIndex")
                        .values(values)
                        .execute()
                }),
                catch: (error) => new DBInsertError(error)
            })
        }

        offset += batchSize
        if (contents.length < batchSize || uris != null) {
            break
        }
    }
}).pipe(Effect.withSpan("updateDiscoverFeedIndex", {attributes: {count: uris?.length ?? -1}}))


/***
 actualizamos las categorías de todos los contenidos que mencionen a algún tema de la lista
 */
export const updateContentCategoriesOnTopicsChange = (
    ctx: AppContext,
    topicIds: string[]
) => Effect.gen(function* () {
    const contents = yield* Effect.tryPromise({
        try: () => ctx.kysely.selectFrom("Reference")
            .where("referencedTopicId", "in", topicIds)
            .select("Reference.referencingContentId")
            .execute(),
        catch: error => new DBSelectError(error)
    })

    yield* updateDiscoverFeedIndex(ctx, contents.map(c => c.referencingContentId))
}).pipe(Effect.withSpan("updateContentCategoriesOnTopicsChange", {attributes: {count: topicIds.length}}))