import {fetchTextBlobs} from "../blob.js";
import {getDidFromUri, getUri} from "@cabildo-abierto/utils";
import {AppContext} from "#/setup.js";
import {CAHandlerNoAuth, EffHandlerNoAuth} from "#/utils/handler.js";
import {
    ArCabildoabiertoWikiTopicVersion,
    ArCabildoabiertoFeedDefs,
    ArCabildoabiertoFeedArticle,
    AppBskyEmbedImages,
    ArCabildoabiertoEmbedVisualization,
    ArCabildoabiertoActorDefs, EditorStatus
} from "@cabildo-abierto/api"
import {Agent} from "#/utils/session-agent.js";
import {anyEditorStateToMarkdownOrLexical} from "#/utils/lexical/transforms.js";
import {DataPlane, makeDataPlane} from "#/services/hydration/dataplane.js";
import {$Typed} from "@atproto/api";
import {getTopicSynonyms, getTopicTitle} from "#/services/wiki/utils.js";
import {getTopicVersionViewer} from "#/services/wiki/history.js";
import {NotFoundError, stringListIncludes, stringListIsEmpty} from "#/services/dataset/read.js"
import {cleanText} from "@cabildo-abierto/utils";
import {getTopicsReferencedInText} from "#/services/wiki/references/references.js";
import {jsonArrayFrom} from "kysely/helpers/postgres";
import {getTopicVersionStatusFromReactions} from "#/services/monetization/author-dashboard.js";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {Effect, Exit, pipe} from "effect";
import {DBError} from "#/services/write/article.js";

export type TimePeriod = "day" | "week" | "month" | "all"

export const getTrendingTopics: EffHandlerNoAuth<{params: {time: TimePeriod}, query: {cursor?: string, limit?: number}}, ArCabildoabiertoWikiTopicVersion.TopicViewBasic[]> = (ctx, agent, {params, query}) => {
    return getTopics(ctx, [], "popular", params.time, query?.limit ?? 10, query?.cursor);
}


export type TopicQueryResultBasic = {
    id: string
    lastEdit: Date | null
    popularityScoreLastDay: number
    popularityScoreLastWeek: number
    popularityScoreLastMonth: number
    props: unknown
    numWords: number | null
    lastRead?: Date | null
    created_at?: Date | null
    uri: string | null
    cid: string | null
}


export type TopicVersionQueryResultBasic = TopicQueryResultBasic & {uri: string}


export const hydrateTopicViewBasicFromUri = (ctx: AppContext, uri: string): Effect.Effect<$Typed<ArCabildoabiertoWikiTopicVersion.TopicViewBasic> | null, never, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane
    const data = dataplane.getState()

    const q = data.topicsByUri.get(uri)
    if(!q) {
        ctx.logger.pino.warn({uri}, "data for topic basic not found")
        return null
    }

    const author = yield* hydrateProfileViewBasic(ctx, getDidFromUri(uri), false)

    return topicQueryResultToTopicViewBasic(q, author ?? undefined)
})


export function topicQueryResultToTopicViewBasic(t: TopicQueryResultBasic, author?: ArCabildoabiertoActorDefs.ProfileViewBasic): $Typed<ArCabildoabiertoWikiTopicVersion.TopicViewBasic> {
    let props: ArCabildoabiertoWikiTopicVersion.TopicProp[] = []

    if(t.props){
        props = t.props as ArCabildoabiertoWikiTopicVersion.TopicProp[]
    } else {
        props.push({
            name: "Título",
            value: {
                $type: "ar.cabildoabierto.wiki.topicVersion#stringProp",
                value: t.id
            }
        })
    }

    return {
        $type: "ar.cabildoabierto.wiki.topicVersion#topicViewBasic",
        id: t.id,
        lastEdit: t.lastEdit?.toISOString() ?? undefined,
        popularity: {
            lastDay: [t.popularityScoreLastDay],
            lastWeek: [t.popularityScoreLastWeek],
            lastMonth: [t.popularityScoreLastMonth]
        },
        props,
        numWords: t.numWords != null ? t.numWords : undefined,
        lastSeen: t.lastRead?.toISOString(),
        versionRef: t.uri && t.cid ? {
            uri: t.uri,
            cid: t.cid
        } : undefined,
        versionAuthor: author,
        versionCreatedAt: t.created_at?.toISOString()
    }
}


export function getTopics(
    ctx: AppContext,
    categories: string[],
    sortedBy: "popular" | "recent",
    time: TimePeriod,
    limit: number = 50,
    cursor?: string
): Effect.Effect<ArCabildoabiertoWikiTopicVersion.TopicViewBasic[], string> {
    return Effect.provideServiceEffect(pipe(
        Effect.promise(() => {
            return ctx.kysely
                .selectFrom('Topic')
                .innerJoin('TopicVersion', 'TopicVersion.uri', 'Topic.currentVersionId')
                .select([
                    "id",
                    "TopicVersion.uri"
                ])
                .where("Topic.lastEdit_tz", "is not", null)
                .innerJoin("Record", "TopicVersion.uri", "Record.uri")
                .where("Record.record", "is not", null)
                .where("Record.cid", "is not", null)
                .$if(categories && categories.length > 0, qb => qb.where(categories.includes("Sin categoría") ?
                    stringListIsEmpty("Categorías") :
                    (eb) =>
                        eb.and(categories.map(c => stringListIncludes("Categorías", c))
                        )
                ))
                .$if(
                    sortedBy == "popular" && (time == "all" || time == "month"),
                    qb => qb
                        .orderBy("popularityScoreLastMonth desc")
                        .orderBy("lastEdit_tz desc")
                )
                .$if(sortedBy == "popular" && time == "week", qb => qb
                    .orderBy("popularityScoreLastWeek desc")
                    .orderBy("lastEdit_tz desc"))
                .$if(sortedBy == "popular" && time == "day", qb => qb
                    .orderBy("popularityScoreLastDay desc")
                    .orderBy("lastEdit_tz desc"))
                .$if(sortedBy == "recent", qb => qb
                    .orderBy("lastEdit_tz desc"))
                .limit(limit)
                .execute()
        }),
        Effect.tap(topics => Effect.gen(function* () {
            const dataplane = yield* DataPlane
            const uris = topics.map(t => t.uri)
            return yield* dataplane.fetchTopicsBasicByUris(uris)
        })),
        Effect.flatMap(topics => {
            return Effect.all(topics
                .map(t => hydrateTopicViewBasicFromUri(
                    ctx,
                    t.uri)))
                .pipe(Effect.map(results => results.filter(x => x != null)))
        }),
        Effect.catchAll(() => {
            return Effect.fail("Ocurrió un error al obtener los temas.")
        })
    ), DataPlane, makeDataPlane(ctx))
}


export const getTopicsHandler: EffHandlerNoAuth<{
    params: { sort: string, time: string },
    query: { c: string[] | string, cursor?: string, limit?: number }
}, ArCabildoabiertoWikiTopicVersion.TopicViewBasic[]> = (ctx, agent, {params, query}) => {
    let {sort, time} = params
    const {c} = query
    const categories = Array.isArray(c) ? c : c ? [c] : []

    if (sort != "popular" && sort != "recent") return Effect.fail(`Criterio de ordenamiento inválido: ${sort}`)
    if (time != "day" && time != "week" && time != "month" && time != "all") {
        return Effect.fail(`Período de tiempo inválido: ${time}`)
    }

    return getTopics(
        ctx,
        categories,
        sort,
        time as TimePeriod,
        query?.limit ?? 50,
        query?.cursor
    )
}


export const getCategories: CAHandlerNoAuth<{}, string[]> = async (ctx, _, {}) => {
    const categories = await ctx.kysely
        .selectFrom("TopicCategory")
        .select("id")
        .execute()
    categories.push({id: "Sin categoría"})
    return {data: categories.map(c => c.id)}
}


async function countTopicsNoCategories(ctx: AppContext) {

    return ctx.kysely
        .selectFrom("Topic")
        .leftJoin("TopicToCategory", "Topic.id", "TopicToCategory.topicId")
        .select(({ fn }) => [fn.count<number>("Topic.id").as("count")])
        .where("TopicToCategory.categoryId", "is", null)
        .where("Topic.currentVersionId", "is not", null)
        .where("Topic.lastEdit_tz", "is not", null)
        .execute()
}


async function countTopicsInEachCategory(ctx: AppContext) {
    return ctx.kysely
        .selectFrom("TopicToCategory")
        .innerJoin("Topic", "TopicToCategory.topicId", "Topic.id")
        .select(({ fn }) => [
            "TopicToCategory.categoryId",
            fn.count<number>("TopicToCategory.topicId").as("count")
        ])
        .where("Topic.currentVersionId", "is not", null)
        .where("Topic.lastEdit", "is not", null)
        .groupBy("TopicToCategory.categoryId")
        .execute()
}


export const getCategoriesWithCounts: CAHandlerNoAuth<{}, { category: string, size: number }[]> = async (ctx, _, {}) => {
    let [categories, noCategoryCount] = await Promise.all([
        countTopicsInEachCategory(ctx),
        countTopicsNoCategories(ctx)
    ])

    categories = categories.filter(c => (c.count > 0))

    const res = categories.map(({categoryId, count}) => ({category: categoryId, size: count}))
    res.push({category: "Sin categoría", size: noCategoryCount[0].count})
    return {data: res}
}


export const redisCacheTTL = 60*60*24*30


export function dbUserToProfileViewBasic(author: {
    did: string,
    handle: string | null,
    displayName: string | null,
    avatar: string | null
    CAProfileUri: string | null,
    userValidationHash: string | null,
    orgValidation: string | null
} | null): ArCabildoabiertoActorDefs.ProfileViewBasic | null {
    if (!author || !author.handle) return null
    return {
        $type: "ar.cabildoabierto.actor.defs#profileViewBasic",
        did: author.did,
        handle: author.handle,
        displayName: author.displayName ?? undefined,
        avatar: author.avatar ?? undefined,
        caProfile: author.CAProfileUri ?? undefined,
        verification: author.orgValidation ? "org" : (author.userValidationHash ? "person" : undefined)
    }
}


export const getTopicCurrentVersionFromDB = (ctx: AppContext, id: string): Effect.Effect<string, NotFoundError | DBError> => Effect.gen(function* () {
    const res = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Topic")
            .select("currentVersionId")
            .where("id", "=", id)
            .executeTakeFirst(),
        catch: () => new DBError()
    })

    if (res && res.currentVersionId) {
        return res.currentVersionId
    } else {
        return yield* Effect.fail(new NotFoundError())
    }
})


export function editorStatusToEsp(s: EditorStatus) {
    if(s == "Editor") return s
    else if(s == "Beginner") return "Editor principiante"
    else if(s == "Administrator") return "Administrador"
}


export function editorStatusToEn(s: ArCabildoabiertoActorDefs.ProfileView["editorStatus"]): EditorStatus {
    if(s == "Editor") return "Editor"
    else if(s == "Editor principiante") return "Beginner"
    else if(s == "Administrador") return "Administrator"
    throw Error(`unknown editor status ${s}`)
}


export class InsufficientParamsError {
    readonly _tag = "InsufficientParamsError"
}


export const getTopic = (ctx: AppContext, agent: Agent, id?: string, did?: string, rkey?: string): Effect.Effect<ArCabildoabiertoWikiTopicVersion.TopicView, DBError | NotFoundError | InsufficientParamsError> => Effect.gen(function* () {

    let uri: string
    if(did && rkey) {
        uri = getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey)
    } else if(id) {
        uri = yield* getTopicCurrentVersionFromDB(ctx, id)
    } else {
        return yield* Effect.fail(new InsufficientParamsError())
    }

    return yield* getTopicVersion(ctx, uri, agent.hasSession() ? agent.did : undefined)
})


export const getTopicHandler: EffHandlerNoAuth<{ query: { i?: string, did?: string, rkey?: string } }, ArCabildoabiertoWikiTopicVersion.TopicView> = (ctx, agent, params) => {
    const {i, did, rkey} = params.query
    return getTopic(ctx, agent, i, did, rkey).pipe(
        Effect.catchTag("InsufficientParamsError", () => Effect.fail("Parámetros inválidos")),
        Effect.catchTag("DBError", () => Effect.fail("Ocurrió un error al obtener el tema.")),
        Effect.catchTag("NotFoundError", () => Effect.fail("No se encontró el tema."))
    )
}


export function hydrateEmbedViews(authorId: string, embeds: ArCabildoabiertoFeedArticle.ArticleEmbed[]): ArCabildoabiertoFeedArticle.ArticleEmbedView[] {
    const views: ArCabildoabiertoFeedArticle.ArticleEmbedView[] = []
    for(let i = 0; i < embeds.length; i++) {
        const e = embeds[i]
        if(ArCabildoabiertoEmbedVisualization.isMain(e.value)){
            views.push({
                $type: "ar.cabildoabierto.feed.article#articleEmbedView",
                value: {
                    ...e.value,
                    $type: "ar.cabildoabierto.embed.visualization"
                },
                index: e.index
            })
        } else if(AppBskyEmbedImages.isMain(e.value)) {
            const embed = e.value
            const imagesView: $Typed<AppBskyEmbedImages.View> = {
                $type: "app.bsky.embed.images#view",
                images: embed.images.map((i: any) => {
                    return {
                        $type: "app.bsky.embed.images#viewImage",
                        alt: i.alt,
                        thumb: `https://cdn.bsky.app/img/feed_thumbnail/plain/${authorId}/${i.image.ref.$link}`,
                        fullsize: `https://cdn.bsky.app/img/feed_fullsize/plain/${authorId}/${i.image.ref.$link}`
                    }
                })
            }
            views.push({
                $type: "ar.cabildoabierto.feed.article#articleEmbedView",
                value: imagesView,
                index: e.index
            })
        }
    }
    return views
}


function processTopicProps(props: ArCabildoabiertoWikiTopicVersion.TopicProp[]) {
    const names = new Set<string>()
    let newProps: ArCabildoabiertoWikiTopicVersion.TopicProp[] = []
    props.forEach(p => {
        if(names.has(p.name)){
            return
        }
        names.add(p.name)
        newProps.push(p)
    })
    return newProps
}


export const getTopicVersion = (ctx: AppContext, uri: string, viewerDid?: string): Effect.Effect<ArCabildoabiertoWikiTopicVersion.TopicView, DBError | NotFoundError> => Effect.gen(function* () {

    const authorId = getDidFromUri(uri)

    const topic = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("TopicVersion")
            .innerJoin("Record", "TopicVersion.uri", "Record.uri")
            .innerJoin("Content", "TopicVersion.uri", "Content.uri")
            .innerJoin("Topic", "Topic.id", "TopicVersion.topicId")
            .innerJoin("User", "User.did", "Record.authorId")
            .select([
                "Record.uri",
                "Record.cid",
                "Record.created_at",
                "Record.record",
                "TopicVersion.props",
                "Content.text",
                "Content.format",
                "Content.dbFormat",
                "Content.textBlobId",
                "Topic.id",
                "Topic.protection",
                "Topic.popularityScore",
                "Topic.lastEdit",
                "Topic.currentVersionId",
                "User.editorStatus",
                eb => eb
                    .selectFrom("Post as Reply")
                    .select(eb => eb.fn.count<number>("Reply.uri").as("count"))
                    .whereRef("Reply.replyToId", "=", "Record.uri").as("replyCount"),
                eb => jsonArrayFrom(eb
                    .selectFrom("Reaction")
                    .whereRef("Reaction.subjectId", "=", "TopicVersion.uri")
                    .innerJoin("Record as ReactionRecord", "ReactionRecord.uri", "Reaction.uri")
                    .innerJoin("User as ReactionAuthor", "ReactionAuthor.did", "ReactionRecord.authorId")
                    .select([
                        "Reaction.uri",
                        "ReactionAuthor.editorStatus"
                    ])
                    .orderBy("ReactionRecord.authorId")
                    .orderBy("ReactionRecord.created_at_tz desc")
                    .distinctOn("ReactionRecord.authorId")
                ).as("reactions")
            ])
            .where("TopicVersion.uri", "=", uri)
            .where("Record.record", "is not", null)
            .where("Record.cid", "is not", null)
            .executeTakeFirst(),
        catch: () => new DBError()
    })

    if (!topic || !topic.cid) {
        return yield* Effect.fail(new NotFoundError())
    }

    let text: string | null = null
    let format: string | null = null
    if (topic.text == null) {
        if (topic.textBlobId) {
            [text] = yield* fetchTextBlobs(
                ctx,
                [{cid: topic.textBlobId, authorId: authorId}]
            )
            format = topic.format
        }
    } else {
        text = topic.text
        format = topic.dbFormat
    }

    const id = topic.id

    const {text: transformedText, format: transformedFormat} = anyEditorStateToMarkdownOrLexical(text, format)

    let props = Array.isArray(topic.props) ? topic.props as ArCabildoabiertoWikiTopicVersion.TopicProp[] : []

    props = processTopicProps(props)

    const record = topic.record ? JSON.parse(topic.record) as ArCabildoabiertoWikiTopicVersion.Record : undefined
    const embeds = record != null ? hydrateEmbedViews(authorId, record.embeds ?? []) : []

    const status = getTopicVersionStatusFromReactions(
        ctx,
        topic.reactions,
        topic.editorStatus,
        topic.protection,
    )

    const viewer = getTopicVersionViewer(
        viewerDid ?? "no did",
        topic.reactions
    )

    const view: ArCabildoabiertoWikiTopicVersion.TopicView = {
        $type: "ar.cabildoabierto.wiki.topicVersion#topicView",
        id,
        uri: topic.uri,
        cid: topic.cid,
        text: transformedText,
        format: transformedFormat,
        props,
        createdAt: topic.created_at.toISOString(),
        lastEdit: topic.lastEdit?.toISOString() ?? topic.created_at.toISOString(),
        currentVersion: topic.currentVersionId ?? undefined,
        record: topic.record ? JSON.parse(topic.record) : undefined,
        embeds,
        status,
        viewer,
        replyCount: topic.replyCount ?? undefined
    }

    return view
})


export const getTopicVersionHandler: EffHandlerNoAuth<{
    params: { did: string, rkey: string }
}, ArCabildoabiertoWikiTopicVersion.TopicView> = (ctx, agent, {params}) => {
    const {did, rkey} = params
    return getTopicVersion(ctx, getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey), agent.hasSession() ? agent.did : undefined).pipe(
        Effect.catchTag("NotFoundError", () => Effect.fail("No se encontró la versión del tema.")),
        Effect.catchTag("DBError", () => Effect.fail("Ocurrió un error al obtener la versión del tema."))
    )
}


// TO DO: Usar el título cuando hagamos que las referencias también lo usen
export const getTopicsMentioned: CAHandlerNoAuth<{title: string, text: string}, ArCabildoabiertoFeedDefs.TopicMention[]> = async (ctx, agent, {title, text}) => {
    const topicMentions = await getTopicsReferencedInText(ctx, text)
    return {
        data: topicMentions
    }
}


export const getAllTopics: CAHandlerNoAuth<{}, {topicId: string, uri: string}[]> = async (ctx, _, {}) => {
    return {error: "sin implementar"}
}


type TopicWithEditors = {
    topicId: string
    editors: string[]
}

export const getTopicsInCategoryForBatchEditing: CAHandlerNoAuth<{params: {cat: string}}, TopicWithEditors[]> = async (ctx, agent, {params}) => {
    const exit = await Effect.runPromiseExit(getTopics(
        ctx,
        [params.cat],
        "recent",
        "all",
        undefined,
        agent.hasSession() ? agent.did : undefined
    ))

    return Exit.match(exit, {
        onSuccess: async topics => {
            const editors = await ctx.kysely
                .selectFrom("TopicVersion")
                .innerJoin("Record", "Record.uri", "TopicVersion.uri")
                .innerJoin("User", "User.did", "Record.authorId")
                .select(["topicId", "User.handle", "User.did"])
                .where("TopicVersion.topicId", "in", topics.map(t => t.id))
                .execute()

            const m = new Map<string, TopicWithEditors>()

            editors.forEach(editor => {
                if(!editor.handle) return
                let cur = m.get(editor.topicId)
                if(!cur) {
                    m.set(editor.topicId, {
                        topicId: editor.topicId,
                        editors: [editor.handle]
                    })
                } else {
                    m.set(editor.topicId, {
                        topicId: editor.topicId,
                        editors: [...cur.editors, editor.handle]
                    })
                }
            })

            return {data: Array.from(m.values())}
        },
        onFailure: error => {
            return {error: error.toString()}
        }
    })
}


export const getTopicsWhereTitleIsNotSetAsSynonym: CAHandlerNoAuth<{}, string[]> = async (ctx, agent, {}) => {
    const topics = await ctx.kysely.selectFrom("Topic")
        .where("Topic.id", "not like", "%Ley%")
        .innerJoin("TopicVersion", "TopicVersion.uri", "Topic.currentVersionId")
        .select(["TopicVersion.props", "Topic.id"])
        .execute()

    const data = topics.filter(t => {
        const synonyms = getTopicSynonyms({
            id: t.id,
            props: t.props as ArCabildoabiertoWikiTopicVersion.TopicProp[]
        })
        return !synonyms.some(s => {
            return cleanText(t.id).includes(cleanText(s))
        })
    })

    return {data: data.map(d => d.id)}
}


export const getTopicsMentionedByContent: CAHandlerNoAuth<{params: {did: string, rkey: string, collection: string}}, {}> = async (ctx, agent, {params}) => {
    const uri = getUri(params.did, params.collection, params.rkey)

    const res = await ctx.kysely
        .selectFrom("Reference")
        .innerJoin("Topic", "Topic.id", "referencedTopicId")
        .innerJoin("TopicVersion", "Topic.currentVersionId", "TopicVersion.uri")
        .where("referencingContentId", "=", uri)
        .select(["referencedTopicId as id", "count", "TopicVersion.props"])
        .execute()

    const data: ArCabildoabiertoFeedDefs.TopicMention[] = res.map(r => {
        return {
            $type: "ar.cabildoabierto.feed.defs#topicMention",
            title: getTopicTitle({id: r.id, props: r.props as ArCabildoabiertoWikiTopicVersion.TopicProp[]}),
            count: r.count ?? 0,
            id: r.id
        }
    })

    return {data}
}