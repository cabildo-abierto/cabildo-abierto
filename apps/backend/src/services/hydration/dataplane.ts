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
import {hydrateProfileViewDetailed} from "#/services/hydration/profile.js";
import {getObjectKey} from "#/utils/object.js";
import {Effect, pipe} from "effect";
import {RedisCacheFetchError, RedisCacheSetError} from "#/services/redis/cache.js";


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
}


export class FetchFromBskyError {
    readonly _tag = "FetchFromBskyError"
}


export class Dataplane {
    ctx: AppContext
    agent: SessionAgent | NoSessionAgent
    caContents: Map<string, FeedElementQueryResult> = new Map()
    bskyPosts: Map<string, AppBskyFeedDefs.PostView> = new Map()
    likes: Map<string, string[]> = new Map()
    reposts: Map<string, RepostQueryResult[]> = new Map() // mapea uri del post a información del repost asociado
    topicsByUri: Map<string, TopicVersionQueryResultBasic> = new Map()
    textBlobs: Map<string, string> = new Map()
    datasets: Map<string, DatasetQueryResult> = new Map()
    datasetContents: Map<string, string[]> = new Map()
    topicsMentioned: Map<string, TopicMentionedProps[]> = new Map()
    s3files: Map<string, string> = new Map()
    requires: Map<string, string[]> = new Map() // mapea un uri a una lista de uris que sabemos que ese contenido requiere que fetcheemos
    notifications: Map<string, NotificationQueryResult> = new Map()
    topicsDatasets: Map<string, { id: string, props: ArCabildoabiertoWikiTopicVersion.TopicProp[] }[]> = new Map()
    rootCreationDates: Map<string, Date> = new Map()

    bskyBasicUsers: Map<string, $Typed<ProfileViewBasic>> = new Map()
    bskyDetailedUsers: Map<string, $Typed<ProfileViewDetailed>> = new Map()

    caUsersDetailed: Map<string, CAProfileDetailed | "not-found"> = new Map()
    caUsers: Map<string, CAProfile | "not-found"> = new Map()
    profiles: Map<string, ArCabildoabiertoActorDefs.ProfileViewDetailed> = new Map()
    profileViewers: Map<string, AppBskyActorDefs.ViewerState> = new Map()

    signedStorageUrls: Map<string, Map<string, string>> = new Map()

    constructor(ctx: AppContext, agent?: SessionAgent | NoSessionAgent) {
        this.ctx = ctx
        this.agent = agent ?? new NoSessionAgent(
            new AtpBaseClient(`${env.HOST}:${env.PORT}`),
            new AtpBaseClient(bskyPublicAPI)
        )
    }

    getDatasetsToFetch(contents: FeedElementQueryResult[]) {
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

    async fetchCAContentsAndBlobs(uris: string[]) {
        await this.fetchCAContents(uris)

        const contents = Array.from(this.caContents?.values() ?? [])

        const blobRefs = blobRefsFromContents(contents
            .filter(c => c.text == null)
        )

        const {datasets, filters} = this.getDatasetsToFetch(contents)

        await Promise.all([
            this.fetchDatasetsHydrationData(datasets),
            this.fetchDatasetContents(datasets),
            this.fetchTextBlobs(blobRefs),
            this.fetchFilteredTopics(filters)
        ])
        //this.ctx.logger.logTimes("fetch ca contents and blobs", [t1, t2, t3])
    }

    async fetchCAContents(uris: string[]) {
        uris = uris.filter(u => !this.caContents?.has(u))
        if (uris.length == 0) return

        const contents = await this.ctx.kysely
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
            .execute()

        contents.forEach(c => {
            if (c.cid) {
                this.caContents.set(c.uri, {
                    ...c,
                    created_at: c.created_at_tz ?? c.created_at,
                    repliesCount: c.repliesCount ? Number(c.repliesCount) : 0,
                    quotesCount: c.quotesCount ? Number(c.quotesCount) : 0,
                    cid: c.cid,
                    selfLabels: c.selfLabels ?? [],
                    articleDescription: c.description,
                    articlePreviewImage: c.previewImage
                })
            } else {
                this.ctx.logger.pino.warn({uri: c.uri}, "content ignored, no cid")
            }
        })
    }

    async fetchTextBlobs(blobs: BlobRef[]) {
        //this.ctx.logger.pino.info({blobs}, "fetching text blobs")
        if(blobs.length == 0) return
        const batchSize = 100
        let texts: (string | null)[] = []
        for (let i = 0; i < blobs.length; i += batchSize) {
            const batchTexts = await fetchTextBlobs(this.ctx, blobs.slice(i, i + batchSize))
            texts.push(...batchTexts)
        }
        const keys = blobs.map(b => getBlobKey(b))

        const entries: [string, string | null][] = texts.map((t, i) => [keys[i], t])
        const m = removeNullValues(new Map<string, string | null>(entries))
        this.textBlobs = joinMaps(this.textBlobs, m)
    }

    async fetchPostAndArticleViewsHydrationData(uris: string[], otherDids: string[] = []) {
        const required = uris.flatMap(u => this.requires.get(u)).filter(x => x != null)
        uris = unique([...uris, ...required])
        const dids = unique([...uris.map(getDidFromUri), ...otherDids])

        await Promise.all([
            this.fetchBskyPosts(postUris(uris)),
            this.fetchCAContentsAndBlobs(uris),
            this.fetchEngagement(uris),
            this.fetchTopicsBasicByUris(topicVersionUris(uris)),
            this.fetchProfileViewBasicHydrationData(dids)
        ])
        //this.ctx.logger.logTimes("fetch posts and article views", [t1, t2])
    }

    async fetchTopicsBasicByUris(uris: string[]) {
        uris = uris.filter(u => !this.topicsByUri?.has(u))
        if (uris.length == 0) return

        const data: TopicVersionQueryResultBasic[] = await this.ctx.kysely
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
            .execute()

        const mapByUri = new Map(data.map(item => [item.uri, item]))

        this.topicsByUri = joinMaps(this.topicsByUri, mapByUri)
    }

    async expandUrisWithRepliesQuotesAndReposts(skeleton: FeedSkeleton): Promise<string[]> {
        const uris = skeleton.map(e => e.post)
        const repostUris = skeleton
            .map(e => e.reason && ArCabildoabiertoFeedDefs.isSkeletonReasonRepost(e.reason) ? e.reason.repost : null)
            .filter(x => x != null)

        const pUris = postUris(uris)

        const caPosts = (await Promise.all([
            this.fetchBskyPosts(pUris),
            pUris.length > 0 ? this.ctx.kysely
                .selectFrom("Post")
                .select(["uri", "replyToId", "quoteToId", "rootId"])
                .where("uri", "in", pUris)
                .execute() : []
        ]))[1]

        const bskyPosts = pUris
            .map(u => this.bskyPosts?.get(u))
            .filter(x => x != null)

        return unique([
            ...uris,
            ...repostUris,
            ...caPosts.map(p => p.replyToId),
            ...caPosts.map(p => p.rootId),
            ...caPosts.map(p => p.quoteToId),
            ...bskyPosts.flatMap(p => {
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
    }

    async fetchFeedHydrationData(skeleton: FeedSkeleton) {
        const expandedUris = await this.expandUrisWithRepliesQuotesAndReposts(skeleton)

        await Promise.all([
            this.fetchPostAndArticleViewsHydrationData(expandedUris),
            this.fetchRepostsHydrationData(expandedUris),
            this.fetchRootCreationDate(skeleton.map(s => s.post))
        ])
    }


    async fetchRootCreationDate(uris: string[]) {
        uris = uris.filter(u => isPost(getCollectionFromUri(u)))
        if (uris.length == 0) return

        const rootCreationDates = await this.ctx.kysely
            .selectFrom("Post")
            .innerJoin("Record", "Record.uri", "Post.rootId")
            .select(["Post.uri", "Record.created_at"])
            .where("Post.uri", "in", uris)
            .execute()

        rootCreationDates.forEach(r => {
            this.rootCreationDates.set(r.uri, r.created_at)
        })
    }


    async fetchRepostsHydrationData(uris: string[]) {
        uris = uris.filter(u => getCollectionFromUri(u) == "app.bsky.feed.repost")
        if (uris.length > 0) {
            const reposts: RepostQueryResult[] = await this.ctx.kysely
                .selectFrom("Reaction")
                .innerJoin("Record", "Reaction.uri", "Record.uri")
                .select([
                    "Record.uri",
                    "Record.created_at",
                    "Reaction.subjectId"
                ])
                .where("Reaction.uri", "in", uris)
                .execute()

            reposts.forEach(r => {
                if (r.subjectId) {
                    this.storeRepost({...r, subjectId: r.subjectId})
                }
            })
        }
    }

    storeBskyPost(uri: string, post: AppBskyFeedDefs.PostView) {
        this.bskyPosts.set(uri, post)
        this.bskyBasicUsers.set(getDidFromUri(uri), {
            ...post.author,
            $type: "app.bsky.actor.defs#profileViewBasic"
        })
        if (post.embed && AppBskyEmbedRecord.isView(post.embed) && AppBskyEmbedRecord.isViewRecord(post.embed.record)) {
            const record = post.embed.record
            const collection = getCollectionFromUri(record.uri)

            if (isPost(collection)) {
                this.storeBskyPost(record.uri, {
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
                this.storeBskyPost(record.uri, {
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
            } else {
                this.ctx.logger.pino.warn({post}, "unknown record with media embed, can't store it")
            }
        } else if (post.embed && AppBskyEmbedRecord.isView(post.embed) && AppBskyEmbedRecord.isViewNotFound(post.embed.record)) {
            const uri = post.embed.record.uri
            const collection = getCollectionFromUri(uri)
            if (isArticle(collection)) {
                this.requires.set(post.uri, [...(this.requires.get(post.uri) ?? []), uri])
            }
        }
    }

    async fetchBskyPosts(uris: string[]) {
        uris = uris.filter(u => !this.bskyPosts?.has(u))
        const agent = this.agent

        const postsList = postUris(uris)
        if (postsList.length == 0) return

        const batches: string[][] = []
        for (let i = 0; i < postsList.length; i += 25) {
            batches.push(postsList.slice(i, i + 25))
        }
        let postViews: PostView[] = []
        try {
            if (batches.length > 1) console.log(`Warning: get bsky posts has ${batches.length} batches.`)
            for (const b of batches) {
                const res = await agent.bsky.app.bsky.feed.getPosts({uris: b})
                postViews.push(...res.data.posts)
            }
        } catch (err) {
            this.ctx.logger.pino.warn({error: err, uris}, "error fetching posts from bsky")
            return
        }

        postViews.forEach(p => {
            this.storeBskyPost(p.uri, p)
        })
    }

    getFetchedBlob(blob: BlobRef): string | null {
        const key = getBlobKey(blob)
        return this.textBlobs?.get(key) ?? null
    }

    async fetchEngagement(uris: string[]) {
        const agent = this.agent
        if (!agent.hasSession()) return
        if (uris.length == 0) return

        const did = agent.did
        const reactions = await this.ctx.kysely
            .selectFrom("Reaction")
            .innerJoin("Record", "Record.uri", "Reaction.uri")
            .select([
                "Reaction.uri",
                "Reaction.subjectId"
            ])
            .where("Record.authorId", "=", did)
            .where("Record.collection", "in", ["app.bsky.feed.like", "app.bsky.feed.repost"])
            .where("Reaction.subjectId", "in", uris)
            .execute()

        reactions.forEach(l => {
            if (l.subjectId) {
                if (getCollectionFromUri(l.uri) == "app.bsky.feed.like") {
                    if (!this.likes.has(l.subjectId)) this.storeLike(l.subjectId, l.uri)
                }
                if (getCollectionFromUri(l.uri) == "app.bsky.feed.repost") {
                    if (!this.reposts.has(l.subjectId)) this.storeRepost({
                        uri: l.uri,
                        created_at: null,
                        subjectId: l.subjectId
                    })
                }
            }
        })
    }

    storeLike(subjectId: string, likeUri: string) {
        const cur = this.likes.get(subjectId) ?? []
        this.likes.set(subjectId, [...cur, likeUri])
    }

    storeRepost(repost: RepostQueryResult & {subjectId: string}) {
        const cur = this.reposts.get(repost.subjectId) ?? []
        this.reposts.set(repost.subjectId, [...cur, repost])
    }

    async fetchThreadHydrationData(skeleton: ThreadSkeleton) {
        let uris = getUrisFromThreadSkeleton(skeleton)

        const reqUris = uris
            .map(u => this.requires.get(u))
            .filter(x => x != null)
            .flatMap(x => x)

        uris = unique([...uris, ...reqUris])

        uris.forEach(u => {
            const r = this.requires.get(u)
            if (r) uris.push()
        })

        uris = await this.expandUrisWithRepliesQuotesAndReposts(uris.map(u => ({post: u})))

        const c = getCollectionFromUri(skeleton.post)

        const dids = uris.map(u => getDidFromUri(u))

        await Promise.all([
            this.fetchPostAndArticleViewsHydrationData(uris),
            this.fetchProfileViewBasicHydrationData(dids),
            isArticle(c) ? this.fetchTopicsMentioned(skeleton.post) : null,
            isDataset(c) ? this.fetchDatasetsHydrationData([skeleton.post]) : null,
            isDataset(c) ? this.fetchDatasetContents([skeleton.post]) : null
        ])
    }

    storeBskyBasicUser(user: ProfileViewBasic) {

        this.bskyBasicUsers.set(user.did, {
            ...user,
            $type: "app.bsky.actor.defs#profileViewBasic"
        })
    }

    storeFeedViewPosts(feed: FeedViewPost[]) {
        feed.forEach(f => {
            this.storeBskyPost(f.post.uri, f.post)
            if (f.reply) {
                if (isPostView(f.reply.parent)) {
                    this.storeBskyPost(f.reply.parent.uri, f.reply.parent)
                }
                if (isPostView(f.reply.root)) {
                    this.storeBskyPost(f.reply.root.uri, f.reply.root)
                }
            }
            if (f.reason) {
                if (AppBskyFeedDefs.isReasonRepost(f.reason) && f.post.uri) {
                    this.storeBskyBasicUser(f.reason.by)
                    this.storeRepost({
                        created_at: new Date(f.reason.indexedAt),
                        subjectId: f.post.uri
                    })
                }
            }
        })
    }

    async fetchDatasetsHydrationData(uris: string[]) {
        uris = uris.filter(u => !this.datasets?.has(u))
        if (uris.length == 0) return

        const datasetsQuery = this.ctx.kysely
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

        const [datasets] = await Promise.all([
            datasetsQuery,
            this.fetchProfileViewBasicHydrationData(dids)
        ])

        for (const d of datasets) {
            if (d.cid) {
                this.datasets.set(d.uri, {
                    ...d,
                    cid: d.cid
                })
            }
        }
    }

    async fetchDatasetContents(uris: string[]) {
        uris = uris.filter(u => isDataset(getCollectionFromUri(u)))
        uris = uris.filter(u => !this.datasetContents?.has(u))

        if (uris.length == 0) return

        await this.fetchDatasetsHydrationData(uris)

        const blobs: { blobRef: BlobRef, datasetUri: string }[] = []

        for (let i = 0; i < uris.length; i++) {
            const uri = uris[i]
            const d = this.datasets?.get(uri)
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

        const contents = (await fetchTextBlobs(this.ctx, blobs.map(b => b.blobRef)))
            .filter(c => c != null)

        const datasetContents = new Map<string, string[]>()
        for (let i = 0; i < blobs.length; i++) {
            const uri = blobs[i].datasetUri
            const content = contents[i]
            const cur = datasetContents.get(uri)
            if (!cur) {
                datasetContents.set(uri, [content])
            } else {
                cur.push(content)
            }
        }

        this.datasetContents = joinMaps(this.datasetContents, datasetContents)
    }


    async fetchTopicsMentioned(uri: string) {

        const topics: TopicMentionedProps[] = (await this.ctx.kysely
            .selectFrom("Reference")
            .innerJoin("Topic", "Reference.referencedTopicId", "Topic.id")
            .innerJoin("TopicVersion", "Topic.currentVersionId", "TopicVersion.uri")
            .select([
                "relevance as count",
                "Topic.id",
                "TopicVersion.props"
            ])
            .where("Reference.referencingContentId", "=", uri)
            .execute())

        if (!this.topicsMentioned) this.topicsMentioned = new Map()
        this.topicsMentioned.set(uri, topics)
    }


    async fetchProfileViewBasicHydrationData(dids: string[]) {
        await this.fetchProfileViewHydrationData(dids) // la única diferencia es la descripción
    }


    async fetchCAUsers(dids: string[]) {
        dids = dids.filter(d => !this.caUsers.has(d) && !this.caUsersDetailed.has(d))
        if(dids.length == 0) return
        const agentDid = this.agent.hasSession() ? this.agent.did : null
        const users = await this.ctx.kysely
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
            .execute()

        users.forEach(u => {
            if(u.handle) {
                this.caUsers.set(u.did, {
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
            } else {
                this.ctx.logger.pino.warn({did: u.did}, "user with no handle, can't hydrate it")
            }
        })
        for(const d of dids) {
            if(!this.caUsers.has(d)){
                this.caUsers.set(d, "not-found")
            }
        }
    }


    async fetchProfileViewHydrationData(dids: string[]) {
        dids = dids.filter(d => {
            if(this.profiles.has(d)) return false
            if(this.caUsers.has(d)) return false
            return !(this.caUsersDetailed.has(d) && (this.bskyBasicUsers.has(d) || this.bskyDetailedUsers.has(d)))
        })

        dids = unique(dids)

        if(dids.length == 0) {
            this.ctx.logger.pino.info({}, "all profile views were skipped")
            return
        }

        // TO DO (!): Esto asume que todos los usuarios de CA están sincronizados. Hay que asegurarlo.
        await this.fetchCAUsers(dids)

        const bskyUsers = dids.filter(d => !this.caUsers.has(d))
        await this.fetchProfileViewDetailedHydrationDataFromBsky(bskyUsers)
    }


    async fetchProfileViewDetailedHydrationDataFromCA(dids: string[]) {
        dids = unique(dids.filter(d => !this.caUsersDetailed.has(d)))
        if (dids.length == 0) return

        const profiles = await this.ctx.kysely
            .selectFrom("User")
            .select([
                "User.did",
                "User.CAProfileUri",
                "editorStatus",
                "userValidationHash",
                "orgValidation",
                (eb) =>
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
                        .as("followsCount"),
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
            .execute()

        const formattedProfiles: CAProfileDetailed[] = profiles.map(profile => {
            if(profile.CAProfileUri){
                return {
                    did: profile.did,
                    editorStatus: profile.editorStatus,
                    caProfile: profile.CAProfileUri,
                    followsCount: profile.followsCount ?? 0,
                    followersCount: profile.followersCount ?? 0,
                    articlesCount: profile.articlesCount ?? 0,
                    editsCount: profile.editsCount ?? 0,
                    verification: getValidationState(profile)
                }
            }
            return null
        }).filter(x => x != null)

        formattedProfiles.forEach(p => {
            this.caUsersDetailed.set(p.did, p)
        })

        for(const d of dids) {
            if(!this.caUsersDetailed.has(d)){
                this.caUsersDetailed.set(d, "not-found")
            }
        }
    }

    async fetchProfileViewDetailedHydrationDataFromBsky(dids: string[]) {
        const agent = this.agent

        dids = unique(dids.filter(d => !this.bskyDetailedUsers.has(d)))
        if (dids.length == 0) return

        const batchSize = 20
        const didBatches: string[][] = []
        for (let i = 0; i < dids.length; i += batchSize) didBatches.push(dids.slice(i, i + batchSize))
        const profiles: ProfileViewDetailed[] = []
        for (let i = 0; i < didBatches.length; i++) {
            const b = didBatches[i]
            const res = await agent.bsky.app.bsky.actor.getProfiles({actors: b})
            profiles.push(...res.data.profiles)
        }

        this.bskyDetailedUsers = joinMaps(
            this.bskyDetailedUsers,
            new Map(profiles.map(v => [v.did, {...v, $type: "app.bsky.actor.defs#profileViewDetailed"}]))
        )
        this.bskyBasicUsers = joinMaps(
            this.bskyBasicUsers,
            new Map(profiles.map(v => [v.did, {...v, $type: "app.bsky.actor.defs#profileViewBasic"}]))
        )
    }


    fetchProfilesViewerState(dids: string[]): Effect.Effect<void, ViewerStateFetchError> {
        const {agent, ctx} = this
        if(!agent.hasSession()) {
            dids.forEach(d => {
                this.profileViewers.set(d, {})
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

                    this.profileViewers.set(did, {
                        following: following ? following.uri : undefined,
                        followedBy: followedBy ? followedBy.uri : undefined
                    })
                })
            })
        )
    }

    fetchProfileViewDetailedHydrationData(dids: string[]): Effect.Effect<void, RedisCacheFetchError | ViewerStateFetchError | FetchFromCAError | FetchFromBskyError | RedisCacheSetError> {
        if(dids.length === 0) return Effect.void

        return pipe(
            // obtenemos los perfiles cacheados y los viewer states
            Effect.all([
                // TO DO: Esta cache está desactivada, ver qué queremos hacer con eso.
                this.ctx.redisCache.profile.getMany(dids),
                this.fetchProfilesViewerState(dids)
            ], {concurrency: "unbounded"}),

            // almacenamos los perfiles cacheados en el dataplane
            Effect.tap(([profiles]) => {
                profiles.forEach(p => {
                    if(p) {
                        this.profiles.set(p.did, p)
                    }
                })
            }),

            // obtenemos los perfiles que no están presentes
            Effect.map(([profiles]) => dids.filter((_, i) => profiles[i] == null)),

            // fetcheamos sus datos de CA y sus datos de Bsky
            Effect.tap(missedDids =>
                Effect.all([
                    Effect.tryPromise({
                        try: () => this.fetchProfileViewDetailedHydrationDataFromCA(missedDids),
                        catch: () => new FetchFromCAError()
                    }),
                    Effect.tryPromise({
                        try: () => this.fetchProfileViewDetailedHydrationDataFromBsky(missedDids),
                        catch: () => new FetchFromBskyError()
                    })
                ], {concurrency: "unbounded"})
            ),

            // los hidratamos para cachearlos
            Effect.flatMap(missedDids => {
                return Effect.succeed(missedDids
                    .map(d => hydrateProfileViewDetailed(this.ctx, d, this))
                    .filter(x => x != null))
            }),
            Effect.tap(newProfiles => {
                newProfiles.forEach(p => {
                    this.profiles.set(p.did, p)
                })
            }),
            Effect.flatMap(newProfiles =>
                this.ctx.redisCache.profile.setMany(newProfiles)
            )
        )
    }

    async fetchFilesFromStorage(filePaths: string[], bucket: string) {
        if(!this.ctx.storage) return
        for (let i = 0; i < filePaths.length; i++) {
            const path = filePaths[i]
            const {data} = await this.ctx.storage.download(path, bucket)

            if (data) {
                const buffer = data.file
                const base64 = Buffer.from(buffer).toString('base64')
                const mimeType = data.contentType

                const fullBase64 = `data:${mimeType};base64,${base64}`
                this.s3files.set(bucket + ":" + path, fullBase64)
            }
        }
    }


    async fetchNotificationsHydrationData(skeleton: NotificationsSkeleton) {
        if (!this.agent.hasSession() || skeleton.length == 0) return

        const reqAuthors = skeleton.map(n => getDidFromUri(n.causedByRecordId))

        const caNotificationsData = (await Promise.all([
            this.ctx.kysely
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
                .where("userNotifiedId", "=", this.agent.did)
                .orderBy("Notification.created_at_tz", "desc")
                .limit(20)
                .execute(),
            this.fetchProfileViewHydrationData(reqAuthors)
        ]))[0]

        caNotificationsData.forEach(n => {
            if(n.created_at_tz != null) this.notifications.set(n.id, {
                ...n,
                created_at: n.created_at_tz
            })
        })
    }

    async fetchFilteredTopics(manyFilters: $Typed<ArCabildoabiertoEmbedVisualization.ColumnFilter>[][]) {
        const datasets = await Promise.all(manyFilters.map(async filters => {

            const filtersByOperator = new Map<string, { column: string, operands: string[] }[]>()
            filters.forEach(f => {
                if (["includes", "=", "in"].includes(f.operator) && f.operands && f.operands.length > 0) {
                    const cur = filtersByOperator.get(f.operator) ?? []
                    filtersByOperator.set(f.operator, [...cur, {column: f.column, operands: f.operands}])
                }
            })

            if (filtersByOperator.size > 0) {
                let query = this.ctx.kysely
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

                return await query
                    .execute() as { id: string, props: ArCabildoabiertoWikiTopicVersion.TopicProp[] }[]
            } else {
                return null
            }
        }))

        datasets.forEach((d, index) => {
            if (d) {
                this.topicsDatasets.set(getObjectKey(manyFilters[index]), d)
            }
        })
    }

    saveDataFromPostThread(thread: ThreadViewPost, includeParents: boolean, excludeChild?: string) {
        if (thread.post) {
            this.storeBskyPost(thread.post.uri, thread.post)

            if (includeParents && thread.parent && isThreadViewPost(thread.parent)) {
                this.saveDataFromPostThread(thread.parent, true, thread.post.uri)
            }

            if (thread.replies) {
                thread.replies.forEach(r => {
                    if (isThreadViewPost(r)) {
                        if (r.post.uri != excludeChild) {
                            this.saveDataFromPostThread(r, true)
                        }
                    } else {
                        this.ctx.logger.pino.info({r}, "reply is not post view")
                    }
                })
            }
        } else {
            this.ctx.logger.pino.info({post: thread.post}, "thread->post no es postView")
        }
    }

    async fetchSignedStorageUrls(paths: string[], bucket: string) {
        paths = paths.filter(p => !this.signedStorageUrls.has(p))
        if(paths.length == 0) return
        const urls = await this.ctx.storage?.getSignedUrlsFromPaths(paths, bucket)
        if(urls) {
            if(!this.signedStorageUrls.has(bucket)) {
                this.signedStorageUrls.set(bucket, new Map<string, string>)
            }
            const cur = this.signedStorageUrls.get(bucket)!
            urls.data.forEach((u, i) => {
                cur.set(paths[i], u)
            })
        }
    }
}