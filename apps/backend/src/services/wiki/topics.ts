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
import {Dataplane} from "#/services/hydration/dataplane.js";
import {$Typed} from "@atproto/api";
import {getTopicSynonyms, getTopicTitle} from "#/services/wiki/utils.js";
import {getTopicVersionViewer} from "#/services/wiki/history.js";
import {stringListIncludes, stringListIsEmpty} from "#/services/dataset/read.js"
import {cleanText} from "@cabildo-abierto/utils";
import {getTopicsReferencedInText} from "#/services/wiki/references/references.js";
import {jsonArrayFrom} from "kysely/helpers/postgres";
import {getTopicVersionStatusFromReactions} from "#/services/monetization/author-dashboard.js";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {Effect, Exit, pipe} from "effect";

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


export function hydrateTopicViewBasicFromUri(ctx: AppContext, uri: string, data: Dataplane): {data?: $Typed<ArCabildoabiertoWikiTopicVersion.TopicViewBasic>, error?: string} {
    const q = data.topicsByUri.get(uri)
    if(!q) {
        data.ctx.logger.pino.warn({uri}, "data for topic basic not found")
        return {error: "No se pudo encontrar el tema."}
    }

    const author = hydrateProfileViewBasic(ctx, getDidFromUri(uri), data, false)

    return {data: topicQueryResultToTopicViewBasic(q, author ?? undefined)}
}


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
    const dataplane = new Dataplane(ctx)

    return pipe(
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
        Effect.tap(topics => {
            return Effect.promise(() => dataplane.fetchTopicsBasicByUris(topics.map(t => t.uri)))
        }),
        Effect.map(topics => {
            return topics
                .map(t => hydrateTopicViewBasicFromUri(ctx, t.uri, dataplane).data)
                .filter(x => x != null)
        }),
        Effect.catchAll(() => {
            return Effect.fail("Ocurrió un error al obtener los temas.")
        })
    )
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


export const getTopicCurrentVersionFromDB = async (ctx: AppContext, id: string): Promise<{
    data?: string | null,
    error?: string
}> => {
    const res = await ctx.kysely
        .selectFrom("Topic")
        .select("currentVersionId")
        .where("id", "=", id)
        .executeTakeFirst()

    if (res) {
        return {data: res.currentVersionId}
    } else {
        return {error: `No se encontró el tema: ${id}`}
    }
}


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


export const getTopic = async (ctx: AppContext, agent: Agent, id?: string, did?: string, rkey?: string): Promise<{
    data?: ArCabildoabiertoWikiTopicVersion.TopicView,
    error?: string
}> => {

    let uri: string
    if(did && rkey) {
        uri = getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey)
    } else if(id) {
        const {data: currentVersionId, error} = await getTopicCurrentVersionFromDB(ctx, id)
        if(!currentVersionId || error) return {error: "No se encontró el tema " + id + "."}
        uri = currentVersionId
    } else {
        return {error: "Parámetros insuficientes."}
    }

    return await getTopicVersion(ctx, uri, agent.hasSession() ? agent.did : undefined)
}


export const getTopicHandler: CAHandlerNoAuth<{ query: { i?: string, did?: string, rkey?: string } }, ArCabildoabiertoWikiTopicVersion.TopicView> = async (ctx, agent, params) => {
    const {i, did, rkey} = params.query
    return getTopic(ctx, agent, i, did, rkey)
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


export const getTopicVersion = async (ctx: AppContext, uri: string, viewerDid?: string): Promise<{
    data?: ArCabildoabiertoWikiTopicVersion.TopicView,
    error?: string
}> => {
    const authorId = getDidFromUri(uri)

    const topic = await ctx.kysely
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
        .executeTakeFirst()

    if (!topic || !topic.cid) {
        ctx.logger.pino.info({uri, topic}, "topic version not found")
        return {error: "No se encontró la versión."}
    }

    let text: string | null = null
    let format: string | null = null
    if (topic.text == null) {
        if (topic.textBlobId) {
            [text] = await fetchTextBlobs(
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
    const embeds = record ? hydrateEmbedViews(authorId, record.embeds ?? []) : []

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

    //ctx.logger.pino.info({view}, "returning topic view")

    return {data: view}
}


export const getTopicVersionHandler: CAHandlerNoAuth<{
    params: { did: string, rkey: string }
}, ArCabildoabiertoWikiTopicVersion.TopicView> = async (ctx, agent, {params}) => {
    const {did, rkey} = params
    return getTopicVersion(ctx, getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey), agent.hasSession() ? agent.did : undefined)
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