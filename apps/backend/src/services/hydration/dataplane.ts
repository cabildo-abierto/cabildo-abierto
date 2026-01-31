import {AppContext} from "#/setup.js";
import {bskyPublicAPI, NoSessionAgent, SessionAgent} from "#/utils/session-agent.js";
import {ProfileViewBasic, ProfileViewDetailed} from "@atproto/api/dist/client/types/app/bsky/actor/defs.js";
import {
    BlobRef, ThreadSkeleton
} from "#/services/hydration/hydrate.js";
import {FeedSkeleton} from "#/services/feed/feed.js";
import {removeNullValues, unique} from "@cabildo-abierto/utils";
import {
    getCollectionFromUri,
    getDidFromUri,
    isArticle,
    isDataset,
    isPost,
    postUris,
    topicVersionUris
} from "@cabildo-abierto/utils";
import {AppBskyFeedDefs} from "@atproto/api"
import {$Typed, AtpBaseClient} from "@atproto/api";
import {TopicVersionQueryResultBasic} from "#/services/wiki/topics.js";
import {
    AppBskyFeedPost,
    ArCabildoabiertoFeedDefs,
    ArCabildoabiertoActorDefs,
    ArCabildoabiertoWikiTopicVersion,
    ArCabildoabiertoEmbedVisualization,
    ArCabildoabiertoFeedArticle
} from "@cabildo-abierto/api"
import {AppBskyEmbedRecord, AppBskyEmbedRecordWithMedia} from "@atproto/api"
import {
    FeedViewPost,
    isPostView,
    isThreadViewPost,
    PostView, ThreadViewPost
} from "@atproto/api/dist/client/types/app/bsky/feed/defs.js";
import {fetchTextBlobs} from "#/services/blob.js";
import {env} from "#/lib/env.js";
import {RepostQueryResult} from "#/services/feed/inicio/following.js";
import {NotificationQueryResult, NotificationsSkeleton} from "#/services/notifications/notifications.js";
import {equalFilterCond, inFilterCond, stringListIncludes} from "#/services/dataset/read.js";
import {jsonArrayFrom} from 'kysely/helpers/postgres'
import {getUrisFromThreadSkeleton} from "#/services/thread/thread.js";
import {getValidationState} from "#/services/user/users.js";
import {AppBskyActorDefs} from "@atproto/api"
import {CAProfileDetailed, CAProfile} from "#/lib/types.js";
import {getObjectKey} from "#/utils/object.js";
import {Context, Effect, pipe, Stream} from "effect";
import {withSpan} from "effect/Effect";
import {toReadonlyArray} from "effect/Chunk";
import {DBError} from "#/services/write/article.js";
import {S3DownloadError, S3GetSignedURLError} from "../storage/storage.js";


export type FeedElementQueryResult = {
    uri: string
    cid: string
    created_at: Date,
    record: string | null
    repliesCount: number
    quotesCount: number
    uniqueLikesCount: number
    uniqueRepostsCount: number
    text: string | null
    textBlobId: string | null
    format: string | null
    dbFormat: string | null
    selfLabels: string[]
    title: string | null
    props: unknown
    topicId: string | null
    embeds: unknown
    datasetsUsed: { uri: string }[]
    editedAt: Date | null
    articleDescription: string | null
    articlePreviewImage: string | null
}


export type DatasetQueryResult = {
    uri: string
    cid: string
    created_at: Date
    title: string
    description: string | null
    columns: string[]
    dataBlocks: {
        cid: string
        format: string | null
    }[]
    editedAt: Date | null
}


export type TopicMentionedProps = {
    count: number | null
    id: string
    props: unknown
}


export function joinMaps<T>(a?: Map<string, T>, b?: Map<string, T>): Map<string, T> {
    return new Map([...a ?? [], ...b ?? []])
}


export function getBlobKey(blob: BlobRef) {
    return blob.cid + ":" + blob.authorId
}


export function blobRefsFromContents(contents: FeedElementQueryResult[]) {
    const blobRefs: { cid: string, authorId: string }[] = contents
        .map(a => (a.textBlobId != null ? {cid: a.textBlobId, authorId: getDidFromUri(a.uri)} : null))
        .filter(x => x != null)

    return blobRefs
}


export class ViewerStateFetchError {
    readonly _tag = "ViewerStateFetchError"
    constructor(readonly message: string) {}
}


export class FetchFromCAError {
    readonly _tag = "FetchFromCAError"
    constructor(readonly message: string) {}
}


export class FetchFromBskyError {
    readonly _tag = "FetchFromBskyError"
}


export class DataPlane extends Context.Tag("DataPlane")<
    DataPlane,
    {
    readonly fetchCAContentsAndBlobs: (uris: string[]) => Effect.Effect<void, DBError | FetchFromBskyError>
    readonly fetchSignedStorageUrls: (paths: string[], bucket: string) => Effect.Effect<void, S3GetSignedURLError>
    readonly fetchFeedHydrationData: (skeleton: FeedSkeleton) => Effect.Effect<void, DBError | FetchFromBskyError>
    readonly fetchThreadHydrationData: (skeleton: ThreadSkeleton) => Effect.Effect<void, DBError | FetchFromBskyError>
    readonly fetchNotificationsHydrationData: (skeleton: NotificationsSkeleton) => Effect.Effect<void, DBError | FetchFromBskyError>
    readonly fetchProfileViewDetailedHydrationData: (dids: string[]) => Effect.Effect<void, ViewerStateFetchError | FetchFromCAError | FetchFromBskyError>
    readonly fetchProfileViewHydrationData: (dids: string[]) => Effect.Effect<void, DBError | FetchFromBskyError>
    readonly fetchProfileViewBasicHydrationData: (dids: string[]) => Effect.Effect<void, ViewerStateFetchError | FetchFromCAError | FetchFromBskyError>
    readonly fetchDatasetsHydrationData: (uris: string[]) => Effect.Effect<void, FetchFromBskyError | DBError>
    readonly fetchDatasetContents: (uris: string[]) => Effect.Effect<void, DBError | FetchFromBskyError>
    readonly fetchFilesFromStorage: (filePaths: string[], bucket: string) => Effect.Effect<void, S3DownloadError>
    readonly storeFeedViewPosts: (feed: FeedViewPost[]) => void
    readonly saveDataFromPostThread: (thread: ThreadViewPost, includeParents: boolean, excludeChild?: string) => void
    readonly getFetchedBlob: (blob: BlobRef) => string | null
    readonly getState: () => {
        caContents: Map<string, FeedElementQueryResult>
        bskyPosts: Map<string, AppBskyFeedDefs.PostView>
        likes: Map<string, string[]>
        reposts: Map<string, RepostQueryResult[]>
        topicsByUri: Map<string, TopicVersionQueryResultBasic>
        textBlobs: Map<string, string>
        datasets: Map<string, DatasetQueryResult>
        datasetContents: Map<string, string[]>
        topicsMentioned: Map<string, TopicMentionedProps[]>
        s3files: Map<string, string>
        notifications: Map<string, NotificationQueryResult>
        topicsDatasets: Map<string, { id: string, props: ArCabildoabiertoWikiTopicVersion.TopicProp[] }[]>
        rootCreationDates: Map<string, Date>
        bskyBasicUsers: Map<string, $Typed<ProfileViewBasic>>
        bskyDetailedUsers: Map<string, $Typed<ProfileViewDetailed>>
        caUsersDetailed: Map<string, CAProfileDetailed | "not-found">
        caUsers: Map<string, CAProfile | "not-found">
        profiles: Map<string, ArCabildoabiertoActorDefs.ProfileViewDetailed>
        profileViewers: Map<string, AppBskyActorDefs.ViewerState>
        signedStorageUrls: Map<string, Map<string, string>>
    }
    readonly fetchFilteredTopics: (manyFilters: $Typed<ArCabildoabiertoEmbedVisualization.ColumnFilter>[][]) => Effect.Effect<void, DBError>
    readonly fetchTopicsBasicByUris: (uris: string[]) => Effect.Effect<void, DBError>
}>() {}


export const makeDataPlane = (ctx: AppContext, inputAgent?: SessionAgent | NoSessionAgent) => Effect.gen(function* () {
    const agent = inputAgent ?? new NoSessionAgent(
        new AtpBaseClient(`${env.HOST}:${env.PORT}`),
        new AtpBaseClient(bskyPublicAPI)
    )
    const caContents = new Map<string, FeedElementQueryResult>()
    const bskyPosts = new Map<string, AppBskyFeedDefs.PostView>()
    const likes = new Map<string, string[]>()
    const reposts = new Map<string, RepostQueryResult[]>() // mapea uri del post a información del repost asociado
    let topicsByUri = new Map<string, TopicVersionQueryResultBasic>()
    let textBlobs = new Map<string, string>()
    const datasets = new Map<string, DatasetQueryResult>()
    let datasetContents = new Map<string, string[]>()
    let topicsMentioned = new Map<string, TopicMentionedProps[]>()
    const s3files = new Map<string, string>()
    const requires = new Map<string, string[]>() // mapea un uri a una lista de uris que sabemos que ese contenido requiere que fetcheemos
    const notifications = new Map<string, NotificationQueryResult>()
    const topicsDatasets = new Map<string, { id: string, props: ArCabildoabiertoWikiTopicVersion.TopicProp[] }[]>()
    const rootCreationDates = new Map<string, Date>()

    let bskyBasicUsers = new Map<string, $Typed<ProfileViewBasic>>()
    let bskyDetailedUsers = new Map<string, $Typed<ProfileViewDetailed>>()

    const caUsersDetailed = new Map<string, CAProfileDetailed | "not-found">()
    const caUsers = new Map<string, CAProfile | "not-found">()
    const profiles = new Map<string, ArCabildoabiertoActorDefs.ProfileViewDetailed>()
    const profileViewers = new Map<string, AppBskyActorDefs.ViewerState>()

    const signedStorageUrls = new Map<string, Map<string, string>>()

    function getDatasetsToFetch(contents: FeedElementQueryResult[]) {
        const datasets = contents.reduce((acc, cur) => {
            return [...acc, ...(cur.datasetsUsed.map(d => d.uri) ?? [])]
        }, [] as string[])

        const filters = contents.reduce((acc, cur) => {
            const filtersInContent: $Typed<ArCabildoabiertoEmbedVisualization.ColumnFilter>[][] = []
            const record = cur.record ? JSON.parse(cur.record) : null
            if (!record) return acc

            const collection = getCollectionFromUri(cur.uri)

            if (isArticle(collection)) {
                const articleRecord = record as ArCabildoabiertoFeedArticle.Record
                if (articleRecord.embeds) {
                    articleRecord.embeds.forEach(e => {
                        if (ArCabildoabiertoEmbedVisualization.isMain(e.value)) {
                            if (e.value.filters) {
                                filtersInContent.push(e.value.filters.filter(ArCabildoabiertoEmbedVisualization.isColumnFilter))
                            }
                        }
                    })
                }
            } else if (isPost(collection)) {
                const postRecord = record as AppBskyFeedPost.Record
                if (postRecord.embed && ArCabildoabiertoEmbedVisualization.isMain(postRecord.embed)) {
                    if (postRecord.embed.filters) {
                        filtersInContent.push(postRecord.embed.filters.filter(ArCabildoabiertoEmbedVisualization.isColumnFilter))
                    }
                }
            }
            return [...acc, ...filtersInContent]
        }, [] as $Typed<ArCabildoabiertoEmbedVisualization.ColumnFilter>[][])

        return {datasets, filters}
    }

    const fetchCAContents = (uris: string[]): Effect.Effect<void, DBError> => Effect.gen(function* () {
        uris = uris.filter(u => !caContents?.has(u))
        if (uris.length == 0) return

        const contents = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("Record")
                .where("Record.uri", "in", uris)
                .leftJoin("Content", "Content.uri", "Record.uri")
                .leftJoin("Article", "Article.uri", "Record.uri")
                .leftJoin("TopicVersion", "TopicVersion.uri", "Record.uri")

                .select([
                    "Record.uri",
                    "Record.cid",
                    "Record.created_at",
                    "Record.created_at_tz",
                    "Record.uniqueLikesCount",
                    "Record.uniqueRepostsCount",
                    eb => eb
                        .selectFrom("Post as Reply")
                        .select(eb => eb.fn.count<number>("Reply.uri").as("count"))
                        .whereRef("Reply.replyToId", "=", "Record.uri").as("repliesCount"),
                    eb => eb
                        .selectFrom("Post as Quote")
                        .select(eb => eb.fn.count<number>("Quote.uri").as("count"))
                        .whereRef("Quote.quoteToId", "=", "Record.uri").as("quotesCount"),
                    "Record.record",
                    "Content.text",
                    "Content.selfLabels",
                    "Content.embeds",
                    "Content.dbFormat",
                    "Content.format",
                    "Content.textBlobId",
                    "Article.title",
                    "Article.description",
                    "Article.previewImage",
                    "TopicVersion.topicId",
                    "TopicVersion.props",
                    "Record.editedAt",
                    eb => jsonArrayFrom(eb
                        .selectFrom("_ContentToDataset")
                        .select("_ContentToDataset.B as uri")
                        .whereRef("_ContentToDataset.A", "=", "Content.uri")
                    ).as("datasetsUsed")

                ])
                .execute(),
            catch: () => new DBError()
        })

        contents.forEach(c => {
            if (c.cid) {
                caContents.set(c.uri, {
                    ...c,
                    created_at: c.created_at_tz ?? c.created_at,
                    repliesCount: c.repliesCount ? Number(c.repliesCount) : 0,
                    quotesCount: c.quotesCount ? Number(c.quotesCount) : 0,
                    cid: c.cid,
                    selfLabels: c.selfLabels ?? [],
                    articleDescription: c.description,
                    articlePreviewImage: c.previewImage
                })
            }
        })
    })

    const dpFetchTextBlobs = (blobs: BlobRef[]) => Effect.gen(function* () {
        if(blobs.length == 0) return
        const batchSize = 100
        let texts: (string | null)[] = []
        for (let i = 0; i < blobs.length; i += batchSize) {
            const batchTexts = yield* fetchTextBlobs(ctx, blobs.slice(i, i + batchSize))
            texts.push(...batchTexts)
        }
        const keys = blobs.map(b => getBlobKey(b))

        const entries: [string, string | null][] = texts.map((t, i) => [keys[i], t])
        const m = removeNullValues(new Map<string, string | null>(entries))
        textBlobs = joinMaps(textBlobs, m)
    })

    const fetchCAUsers = (dids: string[]): Effect.Effect<void, DBError> => Effect.gen(function* () {
        dids = dids.filter(d => !caUsers.has(d) && !caUsersDetailed.has(d))
        if(dids.length == 0) return
        const agentDid = agent?.hasSession() ? agent.did : null
        const users = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("User")
                .where("User.did", "in", dids)
                .select([
                    "did",
                    "CAProfileUri",
                    "handle",
                    "displayName",
                    "avatar",
                    "created_at",
                    "orgValidation",
                    "userValidationHash",
                    "editorStatus",
                    "description",
                    eb => eb
                        .selectFrom("Follow")
                        .where("Follow.userFollowedId", "=", agentDid ?? "no did")
                        .innerJoin("Record", "Record.uri", "Follow.uri")
                        .whereRef("Record.authorId", "=", "User.did")
                        .select("Follow.uri")
                        .limit(1)
                        .as("followedBy"),
                    eb => eb
                        .selectFrom("Follow")
                        .whereRef("Follow.userFollowedId", "=", "User.did")
                        .innerJoin("Record", "Record.uri", "Follow.uri")
                        .where("Record.authorId", "=", agentDid ?? "no did")
                        .select("Follow.uri")
                        .limit(1)
                        .as("following")
                ])
                .where("inCA", "=", true)
                .execute(),
            catch: () => new DBError()
        })

        users.forEach(u => {
            if(u.handle) {
                caUsers.set(u.did, {
                    did: u.did,
                    caProfile: u.CAProfileUri,
                    handle: u.handle,
                    avatar: u.avatar,
                    displayName: u.displayName,
                    createdAt: u.created_at,
                    verification: getValidationState(u),
                    editorStatus: u.editorStatus,
                    description: u.description,
                    viewer: {
                        following: u.following,
                        followedBy: u.followedBy
                    }
                })
            }
        })
        for(const d of dids) {
            if(!caUsers.has(d)){
                caUsers.set(d, "not-found")
            }
        }
    })

    const fetchProfileViewDetailedHydrationDataFromBsky = (dids: string[]): Effect.Effect<void, FetchFromBskyError> => Effect.gen(function* () {
        dids = unique(dids.filter(d => !bskyDetailedUsers.has(d)))
        if (dids.length == 0) return Effect.void

        const batchSize = 20
        const didBatches: string[][] = []
        for (let i = 0; i < dids.length; i += batchSize) didBatches.push(dids.slice(i, i + batchSize))

        const profiles = Stream.runCollect(Stream.make(...didBatches).pipe(
            Stream.mapConcatEffect(b => Effect.tryPromise({
                try: async () => {
                    if(!agent) throw Error()
                    const res = await agent.bsky.app.bsky.actor.getProfiles({actors: b})
                    if(res.success) {
                        return res.data.profiles
                    } else {
                        throw Error()
                    }
                },
                catch: () => new FetchFromBskyError()
            }))
        ))

        return pipe(
            profiles,
            Effect.map(profiles => toReadonlyArray(profiles)),
            Effect.tap(profiles => {
                bskyDetailedUsers = joinMaps(
                    bskyDetailedUsers,
                    new Map(profiles.map(v => [v.did, {...v, $type: "app.bsky.actor.defs#profileViewDetailed"}]))
                )
                bskyBasicUsers = joinMaps(
                    bskyBasicUsers,
                    new Map(profiles.map(v => [v.did, {...v, $type: "app.bsky.actor.defs#profileViewBasic"}]))
                )
            }),
            withSpan("FetchProfileViewDetailedFromBsky")
        )
    })

    const fetchProfileViewHydrationData = (dids: string[]): Effect.Effect<void, FetchFromBskyError | DBError> => Effect.gen(function* () {
        dids = dids.filter(d => {
            if(profiles.has(d)) return false
            if(caUsers.has(d)) return false
            return !(caUsersDetailed.has(d) && (bskyBasicUsers.has(d) || bskyDetailedUsers.has(d)))
        })

        dids = unique(dids)

        if(dids.length == 0) {
            return
        }

        // TO DO (!): Esto asume que todos los usuarios de CA están sincronizados. Hay que asegurarlo.
        yield* fetchCAUsers(dids)

        const bskyUsers = dids.filter(d => !caUsers.has(d))
        yield* fetchProfileViewDetailedHydrationDataFromBsky(bskyUsers)
    })


    const fetchProfileViewBasicHydrationData = (dids: string[]) =>  {
        return fetchProfileViewHydrationData(dids) // la única diferencia es la descripción
    }


    const storeBskyPost = (uri: string, post: AppBskyFeedDefs.PostView) => {
        bskyPosts.set(uri, post)
        bskyBasicUsers.set(getDidFromUri(uri), {
            ...post.author,
            $type: "app.bsky.actor.defs#profileViewBasic"
        })
        if (post.embed && AppBskyEmbedRecord.isView(post.embed) && AppBskyEmbedRecord.isViewRecord(post.embed.record)) {
            const record = post.embed.record
            const collection = getCollectionFromUri(record.uri)

            if (isPost(collection)) {
                storeBskyPost(record.uri, {
                    ...record,
                    uri: record.uri,
                    cid: record.cid,
                    $type: "app.bsky.feed.defs#postView",
                    author: {
                        ...record.author
                    },
                    indexedAt: record.indexedAt,
                    record: record.value,
                    embed: record.embeds && record.embeds.length > 0 ? record.embeds[0] : undefined
                })
            }
        } else if (post.embed && AppBskyEmbedRecordWithMedia.isView(post.embed)) {
            const recordView = post.embed.record
            if (AppBskyEmbedRecord.isViewRecord(recordView.record)) {
                const record = recordView.record
                storeBskyPost(record.uri, {
                    ...record,
                    uri: record.uri,
                    cid: record.cid,
                    $type: "app.bsky.feed.defs#postView",
                    author: {
                        ...record.author
                    },
                    indexedAt: record.indexedAt,
                    record: record.value,
                    embed: record.embeds && record.embeds.length > 0 ? record.embeds[0] : undefined
                })
            }
        } else if (post.embed && AppBskyEmbedRecord.isView(post.embed) && AppBskyEmbedRecord.isViewNotFound(post.embed.record)) {
            const uri = post.embed.record.uri
            const collection = getCollectionFromUri(uri)
            if (isArticle(collection)) {
                requires.set(post.uri, [...(requires.get(post.uri) ?? []), uri])
            }
        }
    }


    const fetchBskyPosts = (uris: string[]): Effect.Effect<void, FetchFromBskyError> => Effect.gen(function* () {
        if(!agent) return
        uris = uris.filter(u => !bskyPosts?.has(u))

        const postsList = postUris(uris)
        if (postsList.length == 0) return

        const batches: string[][] = []
        for (let i = 0; i < postsList.length; i += 25) {
            batches.push(postsList.slice(i, i + 25))
        }
        let postViews: PostView[] = []
        for (const b of batches) {
            const res = yield* Effect.tryPromise({
                try: () => agent.bsky.app.bsky.feed.getPosts({uris: b}),
                catch: () => new FetchFromBskyError()
            })
            postViews.push(...res.data.posts)
        }

        postViews.forEach(p => {
            storeBskyPost(p.uri, p)
        })
    })

    const expandUrisWithRepliesQuotesAndReposts = (skeleton: FeedSkeleton): Effect.Effect<string[], DBError | FetchFromBskyError> => Effect.gen(function* () {
        const uris = skeleton.map(e => e.post)
        const repostUris = skeleton
            .map(e => e.reason && ArCabildoabiertoFeedDefs.isSkeletonReasonRepost(e.reason) ? e.reason.repost : null)
            .filter(x => x != null)

        const pUris = postUris(uris)

        const caPosts = (yield* Effect.all([
            fetchBskyPosts(pUris),
            pUris.length > 0 ? Effect.tryPromise({
                try: () => ctx.kysely
                    .selectFrom("Post")
                    .select(["uri", "replyToId", "quoteToId", "rootId"])
                    .where("uri", "in", pUris)
                    .execute(),
                catch: () => new DBError()
            }) : Effect.succeed([])
        ]))[1]

        const bskyPostsData = pUris
            .map(u => bskyPosts?.get(u))
            .filter(x => x != null)

        return unique([
            ...uris,
            ...repostUris,
            ...caPosts.map(p => p.replyToId),
            ...caPosts.map(p => p.rootId),
            ...caPosts.map(p => p.quoteToId),
            ...bskyPostsData.flatMap(p => {
                const record = p.record as AppBskyFeedPost.Record
                const res = [
                    record.reply?.root?.uri,
                    record.reply?.parent?.uri,
                ]

                if(AppBskyEmbedRecord.isMain(record.embed)){
                    res.push(record.embed.record.uri)
                } else if(AppBskyEmbedRecordWithMedia.isMain(record.embed)){
                    res.push(record.embed.record.record.uri)
                }

                return res
            })
        ].filter(x => x != null))
    })

    const fetchPostAndArticleViewsHydrationData = (uris: string[], otherDids: string[] = []): Effect.Effect<void, DBError | FetchFromBskyError> => Effect.gen(function* () {
        const required = uris.flatMap(u => requires.get(u)).filter(x => x != null)
        uris = unique([...uris, ...required])
        const dids = unique([...uris.map(getDidFromUri), ...otherDids])

        yield* Effect.all([
            fetchBskyPosts(postUris(uris)),
            fetchCAContentsAndBlobs(uris),
            fetchEngagement(uris),
            fetchTopicsBasicByUris(topicVersionUris(uris)),
            fetchProfileViewBasicHydrationData(dids)
        ])
    })

    const fetchThreadHydrationData = (skeleton: ThreadSkeleton): Effect.Effect<void, DBError | FetchFromBskyError> => {
        let uris = getUrisFromThreadSkeleton(skeleton)

        const reqUris = uris
            .map(u => requires.get(u))
            .filter(x => x != null)
            .flatMap(x => x)

        uris = unique([...uris, ...reqUris])

        uris.forEach(u => {
            const r = requires.get(u)
            if (r) uris.push()
        })

        const c = getCollectionFromUri(skeleton.post)

        return pipe(
            expandUrisWithRepliesQuotesAndReposts(uris.map(u => ({post: u}))),
            Effect.flatMap(uris => {
                const dids = uris.map(u => getDidFromUri(u))
                return Effect.all([
                    fetchPostAndArticleViewsHydrationData(uris),
                    fetchProfileViewBasicHydrationData(dids),
                    isArticle(c) ? fetchTopicsMentioned(skeleton.post) : Effect.void,
                    isDataset(c) ? fetchDatasetsHydrationData([skeleton.post]) : Effect.void,
                    isDataset(c) ? fetchDatasetContents([skeleton.post]) : Effect.void
                ], {concurrency: "unbounded"})
            })
        )
    }

    const fetchDatasetsHydrationData = (uris: string[]): Effect.Effect<void, FetchFromBskyError | DBError> => Effect.gen(function* () {
        uris = uris.filter(u => !datasets?.has(u))
        if (uris.length == 0) return

        const datasetsQuery = ctx.kysely
            .selectFrom("Dataset")
            .innerJoin("Record", "Record.uri", "Dataset.uri")
            .where("Record.cid", "is not", null)
            .where("Record.record", "is not", null)
            .select([
                "Dataset.uri",
                "Record.cid",
                "Record.created_at",
                "Dataset.title",
                "Dataset.columns",
                "Dataset.description",
                eb => jsonArrayFrom(eb
                    .selectFrom("DataBlock")
                    .innerJoin("Blob", "DataBlock.cid", "Blob.cid")
                    .whereRef("DataBlock.datasetId", "=", "Dataset.uri")
                    .select([
                        "Blob.cid",
                        "DataBlock.format"
                    ])
                ).as("dataBlocks"),
                "Record.editedAt"
            ])
            .where("Dataset.uri", "in", uris)
            .execute()

        const dids = unique(uris.map(getDidFromUri))

        const [datasetsData] = yield* Effect.all([
            Effect.tryPromise({
                try: () => datasetsQuery,
                catch: () => new DBError()
            }),
            fetchProfileViewBasicHydrationData(dids)
        ], {concurrency: "unbounded"})

        for (const d of datasetsData) {
            if (d.cid) {
                datasets.set(d.uri, {
                    ...d,
                    cid: d.cid
                })
            }
        }
    })

    const fetchDatasetContents = (uris: string[]): Effect.Effect<void, DBError | FetchFromBskyError> => Effect.gen(function* () {
        uris = uris.filter(u => isDataset(getCollectionFromUri(u)))
        uris = uris.filter(u => !datasetContents?.has(u))

        if (uris.length == 0) return

        yield* fetchDatasetsHydrationData(uris)

        const blobs: { blobRef: BlobRef, datasetUri: string }[] = []

        for (let i = 0; i < uris.length; i++) {
            const uri = uris[i]
            const d = datasets?.get(uri)
            if (!d) return

            const authorId = getDidFromUri(uri)
            const blocks = d.dataBlocks

            blobs.push(...blocks.map(b => {
                return {
                    blobRef: {
                        cid: b.cid,
                        authorId
                    },
                    datasetUri: uri
                }
            }))
        }

        const contents = (yield* fetchTextBlobs(ctx, blobs.map(b => b.blobRef)))
            .filter(c => c != null)

        const newDatasetContents = new Map<string, string[]>()
        for (let i = 0; i < blobs.length; i++) {
            const uri = blobs[i].datasetUri
            const content = contents[i]
            const cur = newDatasetContents.get(uri)
            if (!cur) {
                newDatasetContents.set(uri, [content])
            } else {
                cur.push(content)
            }
        }

        datasetContents = joinMaps(datasetContents, newDatasetContents)
    })

    const fetchFilteredTopics = (manyFilters: $Typed<ArCabildoabiertoEmbedVisualization.ColumnFilter>[][]): Effect.Effect<void, DBError> =>  Effect.gen(function* () {

        const datasetsData = yield* Effect.all(manyFilters.map(filters => {
            const filtersByOperator = new Map<string, { column: string, operands: string[] }[]>()

            filters.forEach(f => {
                if (["includes", "=", "in"].includes(f.operator) && f.operands && f.operands.length > 0) {
                    const cur = filtersByOperator.get(f.operator) ?? []
                    filtersByOperator.set(f.operator, [...cur, {column: f.column, operands: f.operands}])
                }
            })

            if (filtersByOperator.size > 0) {
                let query = ctx.kysely
                    .selectFrom('Topic')
                    .innerJoin('TopicVersion', 'TopicVersion.uri', 'Topic.currentVersionId')
                    .select(['id', 'TopicVersion.props'])

                const includesFilters = filtersByOperator.get("includes")
                if (includesFilters) {
                    query = query.where((eb) =>
                        eb.and(includesFilters.map(f => stringListIncludes(f.column, f.operands[0])))
                    )
                }

                const equalFilters = filtersByOperator.get("=")
                if (equalFilters) {
                    query = query.where((eb) =>
                        eb.and(equalFilters.map(f => equalFilterCond(f.column, f.operands[0])))
                    )
                }

                const inFilters = filtersByOperator.get("in")
                if (inFilters) {
                    query = query.where((eb) =>
                        eb.and(inFilters.map(f => inFilterCond(f.column, f.operands)))
                    )
                }

                return Effect.tryPromise({
                    try: async () => (await query
                        .execute()) as { id: string, props: ArCabildoabiertoWikiTopicVersion.TopicProp[] }[],
                    catch: () => new DBError()
                })
            } else {
                return Effect.succeed(null)
            }
        }))

        datasetsData.forEach((d, index) => {
            if (d) {
                topicsDatasets.set(getObjectKey(manyFilters[index]), d)
            }
        })

    })

    const fetchCAContentsAndBlobs = (uris: string[]): Effect.Effect<void, DBError | FetchFromBskyError> => Effect.gen(function* () {
        yield* fetchCAContents(uris)

        const contents = Array.from(caContents?.values() ?? [])

        const blobRefs = blobRefsFromContents(contents
            .filter(c => c.text == null)
        )

        const {datasets, filters} = getDatasetsToFetch(contents)

        yield* Effect.all([
            fetchDatasetsHydrationData(datasets),
            fetchDatasetContents(datasets),
            dpFetchTextBlobs(blobRefs),
            fetchFilteredTopics(filters)
        ], {concurrency: "unbounded"})
    })

    const fetchTopicsBasicByUris = (uris: string[]): Effect.Effect<void, DBError> => Effect.gen(function* () {
        uris = uris.filter(u => !topicsByUri?.has(u))
        if (uris.length == 0) return

        const data: TopicVersionQueryResultBasic[] = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("TopicVersion")
                .innerJoin("Topic", "Topic.id", "TopicVersion.topicId")
                .innerJoin("Record", "Record.uri", "TopicVersion.uri")
                .innerJoin("TopicVersion as CurrentVersion", "CurrentVersion.uri", "Topic.currentVersionId")
                .innerJoin("Content", "TopicVersion.uri", "Content.uri")
                .select([
                    "TopicVersion.uri",
                    "Record.cid",
                    "Topic.id",
                    "Topic.popularityScoreLastDay",
                    "Topic.popularityScoreLastWeek",
                    "Topic.popularityScoreLastMonth",
                    "Topic.lastEdit",
                    "CurrentVersion.props",
                    "Content.numWords",
                    "Record.created_at_tz as created_at"
                ])
                .where("TopicVersion.uri", "in", uris)
                .execute(),
            catch: () => new DBError()
        })

        const mapByUri = new Map(data.map(item => [item.uri, item]))

        topicsByUri = joinMaps(topicsByUri, mapByUri)
    })

    const fetchFeedHydrationData = (skeleton: FeedSkeleton): Effect.Effect<void, DBError | FetchFromBskyError> => Effect.gen(function* () {
        const expandedUris = yield* expandUrisWithRepliesQuotesAndReposts(skeleton)

        yield* Effect.all([
            fetchPostAndArticleViewsHydrationData(expandedUris),
            fetchRepostsHydrationData(expandedUris),
            fetchRootCreationDate(skeleton.map(s => s.post))
        ])
    })

    const fetchRootCreationDate = (uris: string[]): Effect.Effect<void, DBError> => Effect.gen(function* () {
        uris = uris.filter(u => isPost(getCollectionFromUri(u)))
        if (uris.length == 0) return

        const rootCreationDatesData = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("Post")
                .innerJoin("Record", "Record.uri", "Post.rootId")
                .select(["Post.uri", "Record.created_at"])
                .where("Post.uri", "in", uris)
                .execute(),
            catch: () => new DBError()
        })

        rootCreationDatesData.forEach(r => {
            rootCreationDates.set(r.uri, r.created_at)
        })
    })


    const fetchRepostsHydrationData = (uris: string[]): Effect.Effect<void, DBError> => Effect.gen(function* () {
        uris = uris.filter(u => getCollectionFromUri(u) == "app.bsky.feed.repost")
        if (uris.length > 0) {
            const reposts: RepostQueryResult[] = yield* Effect.tryPromise({
                try: () => ctx.kysely
                    .selectFrom("Reaction")
                    .innerJoin("Record", "Reaction.uri", "Record.uri")
                    .select([
                        "Record.uri",
                        "Record.created_at",
                        "Reaction.subjectId"
                    ])
                    .where("Reaction.uri", "in", uris)
                    .execute(),
                catch: () => new DBError()
            })

            reposts.forEach(r => {
                if (r.subjectId) {
                    storeRepost({...r, subjectId: r.subjectId})
                }
            })
        }
    })

    const getFetchedBlob = (blob: BlobRef): string | null => {
        const key = getBlobKey(blob)
        return textBlobs?.get(key) ?? null
    }

    const fetchEngagement = (uris: string[]): Effect.Effect<void, DBError> => Effect.gen(function* () {
        if (!agent.hasSession()) return
        if (uris.length == 0) return

        const did = agent.did
        const reactions = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("Reaction")
                .innerJoin("Record", "Record.uri", "Reaction.uri")
                .select([
                    "Reaction.uri",
                    "Reaction.subjectId"
                ])
                .where("Record.authorId", "=", did)
                .where("Record.collection", "in", ["app.bsky.feed.like", "app.bsky.feed.repost"])
                .where("Reaction.subjectId", "in", uris)
                .execute(),
            catch: () => new DBError()
        })

        reactions.forEach(l => {
            if (l.subjectId) {
                if (getCollectionFromUri(l.uri) == "app.bsky.feed.like") {
                    if (!likes.has(l.subjectId)) storeLike(l.subjectId, l.uri)
                }
                if (getCollectionFromUri(l.uri) == "app.bsky.feed.repost") {
                    if (!reposts.has(l.subjectId)) storeRepost({
                        uri: l.uri,
                        created_at: null,
                        subjectId: l.subjectId
                    })
                }
            }
        })
    })

    function storeLike(subjectId: string, likeUri: string) {
        const cur = likes.get(subjectId) ?? []
        likes.set(subjectId, [...cur, likeUri])
    }

    function storeRepost(repost: RepostQueryResult & {subjectId: string}) {
        const cur = reposts.get(repost.subjectId) ?? []
        reposts.set(repost.subjectId, [...cur, repost])
    }

    function storeBskyBasicUser(user: ProfileViewBasic) {
        bskyBasicUsers.set(user.did, {
            ...user,
            $type: "app.bsky.actor.defs#profileViewBasic"
        })
    }

    function storeFeedViewPosts(feed: FeedViewPost[]) {
        feed.forEach(f => {
            storeBskyPost(f.post.uri, f.post)
            if (f.reply) {
                if (isPostView(f.reply.parent)) {
                    storeBskyPost(f.reply.parent.uri, f.reply.parent)
                }
                if (isPostView(f.reply.root)) {
                    storeBskyPost(f.reply.root.uri, f.reply.root)
                }
            }
            if (f.reason) {
                if (AppBskyFeedDefs.isReasonRepost(f.reason) && f.post.uri) {
                    storeBskyBasicUser(f.reason.by)
                    storeRepost({
                        created_at: new Date(f.reason.indexedAt),
                        subjectId: f.post.uri
                    })
                }
            }
        })
    }

    const fetchTopicsMentioned = (uri: string): Effect.Effect<void, DBError> => Effect.gen(function* () {

        const topics: TopicMentionedProps[] = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("Reference")
                .innerJoin("Topic", "Reference.referencedTopicId", "Topic.id")
                .innerJoin("TopicVersion", "Topic.currentVersionId", "TopicVersion.uri")
                .select([
                    "relevance as count",
                    "Topic.id",
                    "TopicVersion.props"
                ])
                .where("Reference.referencingContentId", "=", uri)
                .execute(),
            catch: () => new DBError()
        })

        if (!topicsMentioned) topicsMentioned = new Map()
        topicsMentioned.set(uri, topics)
    })

    const fetchProfileViewDetailedHydrationDataFromCA = (dids: string[]): Effect.Effect<void, FetchFromCAError> => {
        dids = unique(dids.filter(d => !caUsersDetailed.has(d)))
        if (dids.length == 0) return Effect.void

        return pipe(
            Effect.tryPromise({
                try: () => ctx.kysely
                    .selectFrom("User")
                    .select([
                        "User.did",
                        "User.CAProfileUri",
                        "editorStatus",
                        "userValidationHash",
                        "orgValidation",
                        /*(eb) =>
                            eb
                                .selectFrom("Follow")
                                .innerJoin("Record", "Record.uri", "Follow.uri")
                                .innerJoin("User as Follower", "Follower.did", "Record.authorId")
                                .select(eb.fn.countAll<number>().as("count"))
                                .where("Follower.inCA", "=", true)
                                .whereRef("Follow.userFollowedId", "=", "User.did")
                                .as("followersCount"),
                        (eb) =>
                            eb
                                .selectFrom("Record")
                                .whereRef("Record.authorId", "=", "User.did")
                                .innerJoin("Follow", "Follow.uri", "Record.uri")
                                .innerJoin("User as UserFollowed", "UserFollowed.did", "Follow.userFollowedId")
                                .where("UserFollowed.inCA", "=", true)
                                .select(eb.fn.countAll<number>().as("count"))
                                .as("followsCount"),*/
                        (eb) =>
                            eb
                                .selectFrom("Record")
                                .innerJoin("Article", "Article.uri", "Record.uri")
                                .select(eb.fn.countAll<number>().as("count"))
                                .whereRef("Record.authorId", "=", "User.did")
                                .where("Record.collection", "=", "ar.cabildoabierto.feed.article")
                                .as("articlesCount"),
                        (eb) =>
                            eb
                                .selectFrom("Record")
                                .innerJoin("TopicVersion", "TopicVersion.uri", "Record.uri")
                                .select(eb.fn.countAll<number>().as("count"))
                                .whereRef("Record.authorId", "=", "User.did")
                                .where("Record.collection", "=", "ar.cabildoabierto.wiki.topicVersion")
                                .as("editsCount"),
                    ])
                    .where("User.did", "in", dids)
                    .execute(),
                catch: () => new FetchFromCAError("ProfileViewDetailed")
            }),
            Effect.map(profiles => {
                const formattedProfiles: CAProfileDetailed[] = profiles.map(profile => {
                    if(profile.CAProfileUri){
                        return {
                            did: profile.did,
                            editorStatus: profile.editorStatus,
                            caProfile: profile.CAProfileUri,
                            followsCount: null,
                            followersCount: null,
                            articlesCount: profile.articlesCount ?? 0,
                            editsCount: profile.editsCount ?? 0,
                            verification: getValidationState(profile)
                        }
                    }
                    return null
                }).filter(x => x != null)

                formattedProfiles.forEach(p => {
                    caUsersDetailed.set(p.did, p)
                })

                for(const d of dids) {
                    if(!caUsersDetailed.has(d)){
                        caUsersDetailed.set(d, "not-found")
                    }
                }

                return formattedProfiles
            }),
            withSpan("fetchProfileViewDetailedHydrationDataFromCA", {
                attributes: {
                    profilesCount: dids.length
                }
            })
        )
    }

    const fetchProfilesViewerState = (dids: string[]): Effect.Effect<void, ViewerStateFetchError> => {
        if(!agent.hasSession()) {
            dids.forEach(d => {
                profileViewers.set(d, {})
            })
            return Effect.void
        }

        return pipe(
            Effect.tryPromise({
                try: () => ctx.kysely
                    .selectFrom("Follow")
                    .innerJoin("Record", "Record.uri", "Follow.uri")
                    .select("Follow.uri")
                    .where(eb => eb.or([
                        eb.and([
                            eb("Follow.userFollowedId", "in", dids),
                            eb("Record.authorId", "=", agent.did),
                        ]),
                        eb.and([
                            eb("Follow.userFollowedId", "=", agent.did),
                            eb("Record.authorId", "in", dids)
                        ])
                    ]))
                    .execute(),
                catch: (error) => {
                    const message = error instanceof Error ? error.message : String(error)
                    return new ViewerStateFetchError(message)
                }
            }),
            Effect.tap(follows => {
                dids.forEach(did => {
                    const following = follows.find(f => getDidFromUri(f.uri) == agent.did)
                    const followedBy = follows.find(f => getDidFromUri(f.uri) == did)

                    profileViewers.set(did, {
                        following: following ? following.uri : undefined,
                        followedBy: followedBy ? followedBy.uri : undefined
                    })
                })
            })
        )
    }

    const fetchProfileViewDetailedHydrationData = (dids: string[]): Effect.Effect<void, ViewerStateFetchError | FetchFromCAError | FetchFromBskyError> => {
        if(dids.length === 0) return Effect.void

        return pipe(
            fetchProfilesViewerState(dids),
            Effect.flatMap(() =>
                Effect.all([
                    fetchProfileViewDetailedHydrationDataFromCA(dids),
                    fetchProfileViewDetailedHydrationDataFromBsky(dids)
                ], {concurrency: "unbounded"})
            ),
            Effect.withSpan("fetchProfileViewDetailedHydrationData")
        )
    }

    const fetchFilesFromStorage = (filePaths: string[], bucket: string): Effect.Effect<void, S3DownloadError> => Effect.gen(function* () {
        if(!ctx.storage) return
        for (let i = 0; i < filePaths.length; i++) {
            const path = filePaths[i]
            const {data} = yield* Effect.tryPromise({
                try: () => ctx.storage!.download(path, bucket),
                catch: () => new S3DownloadError()
            })

            if (data) {
                const buffer = data.file
                const base64 = Buffer.from(buffer).toString('base64')
                const mimeType = data.contentType

                const fullBase64 = `data:${mimeType};base64,${base64}`
                s3files.set(bucket + ":" + path, fullBase64)
            }
        }
    })

    const fetchNotificationsHydrationData = (skeleton: NotificationsSkeleton): Effect.Effect<void, DBError | FetchFromBskyError> => Effect.gen(function* () {
        if (!agent.hasSession() || skeleton.length == 0) return

        const reqAuthors = skeleton.map(n => getDidFromUri(n.causedByRecordId))

        const [caNotificationsData] = yield* Effect.all([
            Effect.tryPromise({
                try: () => ctx.kysely
                    .selectFrom("Notification")
                    .innerJoin("Record", "Notification.causedByRecordId", "Record.uri")
                    .leftJoin("TopicVersion", "Notification.reasonSubject", "TopicVersion.uri")
                    .select([
                        "Notification.id",
                        "Notification.userNotifiedId",
                        "Notification.causedByRecordId",
                        "Notification.message",
                        "Notification.moreContext",
                        "Notification.created_at_tz",
                        "Notification.type",
                        "Notification.reasonSubject",
                        "Record.cid",
                        "Record.record",
                        "TopicVersion.topicId"
                    ])
                    .where("userNotifiedId", "=", agent.did)
                    .orderBy("Notification.created_at_tz", "desc")
                    .limit(20)
                    .execute(),
                catch: () => new DBError()
            }),
            fetchProfileViewHydrationData(reqAuthors)
        ])

        caNotificationsData.forEach(n => {
            if(n.created_at_tz != null) notifications.set(n.id, {
                ...n,
                created_at: n.created_at_tz
            })
        })
    })

    function saveDataFromPostThread(thread: ThreadViewPost, includeParents: boolean, excludeChild?: string) {
        if (thread.post) {
            storeBskyPost(thread.post.uri, thread.post)

            if (includeParents && thread.parent && isThreadViewPost(thread.parent)) {
                saveDataFromPostThread(thread.parent, true, thread.post.uri)
            }

            if (thread.replies) {
                thread.replies.forEach(r => {
                    if (isThreadViewPost(r)) {
                        if (r.post.uri != excludeChild) {
                            saveDataFromPostThread(r, true)
                        }
                    }
                })
            }
        }
    }

    const fetchSignedStorageUrls = (paths: string[], bucket: string): Effect.Effect<void, S3GetSignedURLError> => Effect.gen(function* () {
        paths = paths.filter(p => !signedStorageUrls.has(p))
        if(paths.length == 0) return
        if(!ctx.storage) return
        const urls = yield* Effect.tryPromise({
            try: () => ctx.storage!.getSignedUrlsFromPaths(paths, bucket),
            catch: () => new S3GetSignedURLError()
        })
        if(urls) {
            if(!signedStorageUrls.has(bucket)) {
                signedStorageUrls.set(bucket, new Map<string, string>)
            }
            const cur = signedStorageUrls.get(bucket)!
            urls.data.forEach((u, i) => {
                cur.set(paths[i], u)
            })
        }
    })

    return {
        fetchCAContentsAndBlobs,
        fetchSignedStorageUrls,
        fetchFeedHydrationData,
        fetchThreadHydrationData,
        fetchNotificationsHydrationData,
        fetchProfileViewDetailedHydrationData,
        fetchDatasetsHydrationData,
        fetchDatasetContents,
        fetchFilesFromStorage,
        getState: () => ({
            caContents,
            bskyPosts,
            likes,
            reposts,
            topicsByUri,
            textBlobs,
            datasets,
            datasetContents,
            topicsMentioned,
            s3files,
            notifications,
            topicsDatasets,
            rootCreationDates,
            bskyBasicUsers,
            bskyDetailedUsers,
            caUsersDetailed,
            caUsers,
            profiles,
            profileViewers,
            signedStorageUrls
        }),
        storeFeedViewPosts,
        saveDataFromPostThread,
        getFetchedBlob,
        fetchFilteredTopics,
        fetchTopicsBasicByUris,
        fetchProfileViewBasicHydrationData,
        fetchProfileViewHydrationData
    } as const
})