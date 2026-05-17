import {AppContext} from "#/setup.js";
import {bskyPublicAPI, NoSessionAgent, SessionAgent} from "#/utils/session-agent.js";
import {ProfileViewBasic, ProfileViewDetailed} from "@atproto/api/dist/client/types/app/bsky/actor/defs.js";
import {
    BlobRef
} from "#/services/hydration/hydrate.js";
import {removeNullValues, unique} from "@cabildo-abierto/utils";
import {
    getCollectionFromUri,
    getDidFromUri,
    isDataset
} from "@cabildo-abierto/utils";
import {$Typed, AtpBaseClient} from "@atproto/api";
import {TopicVersionQueryResultBasic} from "#/services/wiki/topic.js";
import {
    ArCabildoabiertoActorDefs,
    ArCabildoabiertoWikiTopic,
    ArCabildoabiertoEmbedVisualization
} from "@cabildo-abierto/api"
import {FetchBlobError, fetchTextBlobs} from "#/services/blob.js";
import {env} from "#/lib/env.js";
import {NotificationQueryResult, NotificationsSkeleton} from "#/services/notifications/notifications.js";
import {jsonArrayFrom} from 'kysely/helpers/postgres'
import {getValidationState} from "#/services/user/users.js";
import {AppBskyActorDefs} from "@atproto/api"
import {CAProfileDetailed, CAProfile} from "#/lib/types.js";
import {getObjectKey} from "#/utils/object.js";
import {Context, Effect, pipe, Stream} from "effect";
import {toReadonlyArray} from "effect/Chunk";
import {S3DownloadError, S3GetSignedURLError} from "../storage/storage.js";

import {DBSelectError} from "#/utils/errors.js";


export const av = (m: Map<string, any> | null, k:  string) => {
    const v = m?.get(k)
    return v != null && v != "not-found"
}

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
    createdAt: Date
    title: string
    description: string | null
    columns: string[]
    blobCid: string | null
    url: string | null
    format: string | null
}


export type TopicMentionedProps = {
    count: number | null
    id: string
    props: unknown
}

export function joinMapsInPlace<T>(a: Map<string, T>, b?: Map<string, T>) {
    if(b) for(const [key, value] of b.entries()) {
        a.set(key, value)
    }
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


export type PollQueryResult = {
    description: string | null
    choices: string[]
    createdAt: Date
    votes: {
        uri: string
        choice: string
    }[]
    topicId: string | null
    parentRecordId: string | null
}


export class DataPlane extends Context.Tag("DataPlane")<
    DataPlane,
    {
    readonly fetchSignedStorageUrls: (paths: string[], bucket: string) => Effect.Effect<void, S3GetSignedURLError>
    readonly fetchNotificationsHydrationData: (skeleton: NotificationsSkeleton) => Effect.Effect<void, DBSelectError | FetchFromBskyError>
    readonly fetchProfileViewDetailedHydrationData: (dids: string[]) => Effect.Effect<void, ViewerStateFetchError | FetchFromCAError | FetchFromBskyError>
    readonly fetchProfileViewBasicHydrationData: (dids: string[]) => Effect.Effect<void, DBSelectError | FetchFromBskyError>
    readonly fetchDatasetsHydrationData: (uris: string[]) => Effect.Effect<void, FetchFromBskyError | DBSelectError>
    readonly fetchDatasetContents: (uris: string[]) => Effect.Effect<void, DBSelectError | FetchFromBskyError>
    readonly fetchFilesFromStorage: (filePaths: string[], bucket: string) => Effect.Effect<void, S3DownloadError>
    readonly getFetchedBlob: (blob: BlobRef) => string | null
    readonly getState: () => {
        caContents: Map<string, FeedElementQueryResult>
        topicsByUri: Map<string, TopicVersionQueryResultBasic>
        textBlobs: Map<string, string>
        datasets: Map<string, DatasetQueryResult>
        datasetContents: Map<string, string[]>
        topicsMentioned: Map<string, TopicMentionedProps[]>
        s3files: Map<string, string>
        notifications: Map<string, NotificationQueryResult>
        topicsDatasets: Map<string, { id: string, props: ArCabildoabiertoWikiTopic.TopicProp[] }[]>
        rootCreationDates: Map<string, Date>
        caUsersDetailed: Map<string, CAProfileDetailed | "not-found">
        caUsers: Map<string, CAProfile | "not-found">
        profiles: Map<string, ArCabildoabiertoActorDefs.ProfileViewDetailed>
        profileViewers: Map<string, AppBskyActorDefs.ViewerState>
        signedStorageUrls: Map<string, Map<string, string>>
        polls: Map<string, PollQueryResult>
    }
    readonly fetchFilteredTopics: (manyFilters: $Typed<ArCabildoabiertoEmbedVisualization.ColumnFilter>[][]) => Effect.Effect<void, DBSelectError>
    readonly fetchTopicsBasicByUris: (uris: string[]) => Effect.Effect<void, DBSelectError>
    readonly dpFetchTextBlobs: (blobs: BlobRef[]) => Effect.Effect<void, FetchBlobError>
    readonly fetchPollsHydrationData: (ids: string[]) => Effect.Effect<void, DBSelectError>
}>() {}


export const makeDataPlane = (ctx: AppContext, inputAgent?: SessionAgent | NoSessionAgent) => Effect.gen(function* () {
    const agent = inputAgent ?? new NoSessionAgent(
        new AtpBaseClient(`${env.HOST}:${env.PORT}`),
        new AtpBaseClient(bskyPublicAPI)
    )
    const caContents = new Map<string, FeedElementQueryResult>()
    let topicsByUri = new Map<string, TopicVersionQueryResultBasic>()
    let textBlobs = new Map<string, string>()
    const datasets = new Map<string, DatasetQueryResult>()
    let datasetContents = new Map<string, string[]>()
    let topicsMentioned = new Map<string, TopicMentionedProps[]>()
    const s3files = new Map<string, string>()
    const notifications = new Map<string, NotificationQueryResult>()
    const topicsDatasets = new Map<string, { id: string, props: ArCabildoabiertoWikiTopic.TopicProp[] }[]>()
    const rootCreationDates = new Map<string, Date>()

    let bskyProfileViewBasicData = new Map<string, $Typed<ProfileViewBasic>>()
    let bskyProfileViewDetailedData = new Map<string, $Typed<ProfileViewDetailed>>()

    const caProfileDetailedData = new Map<string, CAProfileDetailed | "not-found">()
    const caProfileData = new Map<string, CAProfile | "not-found">()
    const caProfileViewDetailedData = new Map<string, ArCabildoabiertoActorDefs.ProfileViewDetailed>()
    const viewerStateData = new Map<string, AppBskyActorDefs.ViewerState>()

    const polls = new Map<string, PollQueryResult>()

    const signedStorageUrls = new Map<string, Map<string, string>>()

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
        joinMapsInPlace(textBlobs, m)
    })

    const fetchCAUsers = (dids: string[]): Effect.Effect<void, DBSelectError> => Effect.gen(function* () {
        dids = dids.filter(d => !av(caProfileData, d) && !av(caProfileDetailedData, d))
        if(dids.length == 0) return
        const users = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("User")
                .where("User.did", "in", dids)
                .select([
                    "did",
                    "handle",
                    "displayName",
                    "description",
                    "avatar",
                    "createdAt",
                    "orgValidation",
                    "userValidationHash",
                ])
                .where("inCA", "=", true)
                .execute(),
            catch: (error) => new DBSelectError(error)
        })

        users.forEach(u => {
            if(u.handle) {
                caProfileData.set(u.did, {
                    did: u.did,
                    handle: u.handle,
                    avatar: u.avatar,
                    displayName: u.displayName,
                    createdAt: u.createdAt,
                    verification: getValidationState(u),
                    description: u.description
                })
            }
        })
        for(const d of dids) {
            if(!av(caProfileData, d)){
                caProfileData.set(d, "not-found")
            }
        }
    }).pipe(Effect.withSpan("fetchCAUsers"))

    const fetchProfileViewDetailedHydrationDataFromBsky = (dids: string[]): Effect.Effect<void, FetchFromBskyError> => Effect.gen(function* () {
        dids = unique(dids.filter(d => !av(bskyProfileViewDetailedData, d)))

        yield* Effect.annotateCurrentSpan({
            didsCount: dids.length
        })

        if (dids.length == 0) return yield* Effect.void

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

        return yield* pipe(
            profiles,
            Effect.map(profiles => toReadonlyArray(profiles)),
            Effect.tap(profiles => {
                joinMapsInPlace(
                    bskyProfileViewDetailedData,
                    new Map(profiles.map(v => [v.did, {...v, $type: "app.bsky.actor.defs#profileViewDetailed"}]))
                )
                const newBasicProfiles = new Map<string, $Typed<AppBskyActorDefs.ProfileViewBasic>>(profiles.map(v => [v.did, {...v, $type: "app.bsky.actor.defs#profileViewBasic"}]))
                joinMapsInPlace(
                    bskyProfileViewBasicData,
                    newBasicProfiles
                )
            })
        )
    }).pipe(Effect.withSpan("fetchProfileViewDetailedFromBsky"))

    const fetchProfileViewHydrationData = (dids: string[]): Effect.Effect<void, FetchFromBskyError | DBSelectError> => Effect.gen(function* () {
        dids = dids.filter(d => {
            if(av(caProfileViewDetailedData, d)) return false
            if(av(caProfileData, d)) return false
            return !(av(caProfileDetailedData, d) && (av(bskyProfileViewBasicData, d) || av(bskyProfileViewDetailedData, d)))
        })

        dids = unique(dids)

        if(dids.length == 0) {
            return
        }

        // TO DO (!): Esto asume que todos los usuarios de CA están sincronizados. Hay que asegurarlo.
        yield* fetchCAUsers(dids)

        const bskyUsers = dids.filter(d => !av(caProfileData, d))
        yield* fetchProfileViewDetailedHydrationDataFromBsky(bskyUsers)
    })

    const fetchProfileViewBasicHydrationData = (dids: string[]) => {
        return fetchProfileViewHydrationData(dids) // la única diferencia es la descripción
    }

    const fetchDatasetsHydrationData = (uris: string[]): Effect.Effect<void, FetchFromBskyError | DBSelectError> => Effect.gen(function* () {
        uris = uris.filter(u => !av(datasets, u))
        if (uris.length == 0) return

        const datasetsQuery = ctx.kysely
            .selectFrom("Dataset")
            .innerJoin("Record", "Record.uri", "Dataset.uri")
            .leftJoin("Blob", "Dataset.blobCid", "Blob.cid")
            .where("Record.cid", "is not", null)
            .where("Record.record", "is not", null)
            .select([
                "Dataset.uri",
                "Record.cid",
                "Record.createdAt",
                "Dataset.title",
                "Dataset.columns",
                "Dataset.description",
                "Dataset.url",
                "Dataset.blobCid",
                "Dataset.format"
            ])
            .where("Dataset.uri", "in", uris)
            .execute()

        const dids = unique(uris.map(getDidFromUri))

        const [datasetsData] = yield* Effect.all([
            Effect.tryPromise({
                try: () => datasetsQuery,
                catch: (error) => new DBSelectError(error)
            }),
            fetchProfileViewBasicHydrationData(dids)
        ], {concurrency: "unbounded"})

        for (const d of datasetsData) {
            if (d.cid) {
                datasets.set(d.uri, {
                    ...d,
                    createdAt: d.createdAt!,
                    cid: d.cid
                })
            }
        }
    })

    const fetchDatasetContents = (uris: string[]): Effect.Effect<void, DBSelectError | FetchFromBskyError> => Effect.gen(function* () {
        uris = uris.filter(u => isDataset(getCollectionFromUri(u)))
        uris = uris.filter(u => !av(datasetContents, u))

        if (uris.length == 0) return

        yield* fetchDatasetsHydrationData(uris)

        const blobs: { blobRef: BlobRef, datasetUri: string }[] = []

        for (let i = 0; i < uris.length; i++) {
            const uri = uris[i]
            const d = datasets?.get(uri)
            if (!d) return

            if(d.blobCid) {
                blobs.push({
                    blobRef: {
                        cid: d.blobCid,
                        authorId: getDidFromUri(d.uri)
                    },
                    datasetUri: uri
                })
            }
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

        joinMapsInPlace(datasetContents, newDatasetContents)
    })

    const fetchFilteredTopics = (manyFilters: $Typed<ArCabildoabiertoEmbedVisualization.ColumnFilter>[][]): Effect.Effect<void, DBSelectError> =>  Effect.gen(function* () {

        const datasetsData = yield* Effect.all(manyFilters.map(filters => {
            const filtersByOperator = new Map<string, { column: string, operands: string[] }[]>()

            filters.forEach(f => {
                if (["includes", "=", "in"].includes(f.operator) && f.operands && f.operands.length > 0) {
                    const cur = filtersByOperator.get(f.operator) ?? []
                    filtersByOperator.set(f.operator, [...cur, {column: f.column, operands: f.operands}])
                }
            })

            if (filtersByOperator.size > 0) {
                return Effect.fail(new DBSelectError())
                /*let query = ctx.kysely
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
                        .execute()) as { id: string, props: ArCabildoabiertoWikiTopic.TopicProp[] }[],
                    catch: (error) => new DBSelectError(error)
                })*/
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

    const fetchTopicsBasicByUris = (uris: string[]): Effect.Effect<void, DBSelectError> => Effect.gen(function* () {
        uris = uris.filter(u => !av(topicsByUri, u))
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
                    "CurrentVersion.props",
                    "Record.createdAt",
                    eb => eb.selectFrom("Comment")
                        .whereRef("Comment.replyToId", "=", "TopicVersion.uri")
                        .select(eb => eb.fn.count<number>("Comment.uri").as("replyCount"))
                        .as("replyCount"),
                    eb => eb
                        .selectFrom("TopicVersion as edit")
                        .whereRef("edit.topicId", "=", "TopicVersion.topicId")
                        .select(eb => eb.fn.count<number>("edit.uri").as("editsCount"))
                        .as("editsCount"),
                    eb => eb
                        .selectFrom("Consensus")
                        .whereRef("Consensus.topicId", "=", "TopicVersion.topicId")
                        .select(eb => eb.fn.count<number>("Consensus.id").as("consensusCount"))
                        .as("consensusCount")
                ])
                .where("TopicVersion.uri", "in", uris)
                .execute(),
            catch: (error) => new DBSelectError(error)
        })

        const mapByUri = new Map(data.map(item => [item.uri, item]))

        joinMapsInPlace(topicsByUri, mapByUri)
    }).pipe(Effect.withSpan("fetchTopicsBasicByUris"))


    const getFetchedBlob = (blob: BlobRef): string | null => {
        const key = getBlobKey(blob)
        return textBlobs?.get(key) ?? null
    }

    const fetchProfileViewDetailedHydrationData = (dids: string[]): Effect.Effect<void, FetchFromCAError> => Effect.gen(function* () {
        dids = unique(dids.filter(d => !av(caProfileDetailedData, d)))

        yield* Effect.annotateCurrentSpan({didsCount: dids.length})

        if (dids.length == 0) return yield* Effect.void

        return yield* pipe(
            Effect.tryPromise({
                try: () => ctx.kysely
                    .selectFrom("User")
                    .select([
                        "User.did",
                        "userValidationHash",
                        "orgValidation",
                        (eb) =>
                            eb
                                .selectFrom("Record")
                                .innerJoin("ConsensusVersion", "ConsensusVersion.uri", "Record.uri")
                                .select(eb.fn.countAll<number>().as("count"))
                                .whereRef("Record.authorId", "=", "User.did")
                                .where("Record.collection", "=", "ar.cabildoabierto.wiki.consensus")
                                .as("consensusCount"),
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
                    return {
                        did: profile.did,
                        editsCount: profile.editsCount ?? 0,
                        consensusCount: profile.consensusCount ?? 0,
                        verification: getValidationState(profile)
                    }
                }).filter(x => x != null)

                formattedProfiles.forEach(p => {
                    caProfileDetailedData.set(p.did, p)
                })

                for(const d of dids) {
                    if(!av(caProfileDetailedData, d)){
                        caProfileDetailedData.set(d, "not-found")
                    }
                }

                return formattedProfiles
            })
        )
    }).pipe(Effect.withSpan("fetchProfileViewDetailedHydrationData"))

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

    const fetchNotificationsHydrationData = (skeleton: NotificationsSkeleton): Effect.Effect<void, DBSelectError | FetchFromBskyError> => Effect.gen(function* () {
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
                        "Notification.createdAt",
                        "Notification.type",
                        "Notification.reasonSubject",
                        "Record.cid",
                        "Record.record",
                        "TopicVersion.topicId"
                    ])
                    .where("userNotifiedId", "=", agent.did)
                    .orderBy("Notification.createdAt", "desc")
                    .limit(20)
                    .execute(),
                catch: (error) => new DBSelectError(error)
            }),
            fetchProfileViewHydrationData(reqAuthors)
        ], {concurrency: "unbounded"})

        caNotificationsData.forEach(n => {
            notifications.set(n.id, n)
        })
    })

    const fetchSignedStorageUrls = (paths: string[], bucket: string): Effect.Effect<void, S3GetSignedURLError> => Effect.gen(function* () {
        paths = paths.filter(p => !av(signedStorageUrls, p))
        if(paths.length == 0) return
        if(!ctx.storage) return
        const urls = yield* Effect.tryPromise({
            try: () => ctx.storage!.getSignedUrlsFromPaths(paths, bucket),
            catch: () => new S3GetSignedURLError()
        })
        if(urls) {
            if(!av(signedStorageUrls, bucket)) {
                signedStorageUrls.set(bucket, new Map<string, string>)
            }
            const cur = signedStorageUrls.get(bucket)!
            urls.data.forEach((u, i) => {
                cur.set(paths[i], u)
            })
        }
    })

    const fetchPollsHydrationData = (ids: string[]): Effect.Effect<void, DBSelectError> => Effect.gen(function* () {
        if(ids.length == 0) return
        const res = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("Poll")
                .select([
                    "id",
                    "choices",
                    "createdAt",
                    "description",
                    "topicId",
                    "parentRecordId",
                    eb => jsonArrayFrom(eb
                        .selectFrom("Reaction")
                        .innerJoin("Record", "Record.uri", "Reaction.uri")
                        .whereRef("Reaction.pollId", "=", "Poll.id")
                        .select(["Reaction.label as choice", "Reaction.uri"])
                        .orderBy("createdAt desc")
                    ).as("votes")
                ])
                .where("id", "in", ids)
                .execute(),
            catch: error => new DBSelectError(error)
        })
        res.forEach(r => polls.set(r.id, r))
    }).pipe(Effect.withSpan("fetchPollsHydrationData", {attributes: {count: ids.length}}))

    return {
        fetchSignedStorageUrls,
        fetchNotificationsHydrationData,
        fetchProfileViewDetailedHydrationData,
        fetchDatasetsHydrationData,
        fetchDatasetContents,
        fetchFilesFromStorage,
        getState: () => ({
            caContents,
            topicsByUri,
            textBlobs,
            datasets,
            datasetContents,
            topicsMentioned,
            s3files,
            notifications,
            topicsDatasets,
            rootCreationDates,
            bskyBasicUsers: bskyProfileViewBasicData,
            bskyDetailedUsers: bskyProfileViewDetailedData,
            caUsersDetailed: caProfileDetailedData,
            caUsers: caProfileData,
            profiles: caProfileViewDetailedData,
            profileViewers: viewerStateData,
            signedStorageUrls,
            polls
        }),
        getFetchedBlob,
        fetchFilteredTopics,
        fetchTopicsBasicByUris,
        fetchProfileViewBasicHydrationData,
        fetchProfileViewHydrationData,
        dpFetchTextBlobs,
        fetchPollsHydrationData
    } as const
})