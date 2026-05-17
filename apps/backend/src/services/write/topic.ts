import {SessionAgent} from "#/utils/session-agent.js";
import {EffHandler} from "#/utils/handler.js";
import {
    ArCabildoabiertoEmbedPoll,
    ArCabildoabiertoWikiTopic,
    CreateTopicVersionProps,
} from "@cabildo-abierto/api"
import {
    UploadImageFromBase64Error,
    UploadStringBlobError
} from "#/services/blob.js";
import {topicRecordProcessor} from "#/services/sync/event-processing/topic.js";
import {processValidatedRecords} from "#/services/record/processing.js";
import {Effect} from "effect";
import {ATCreateRecordError} from "#/services/votes/votes.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {AppContext} from "#/setup.js";
import {DBSelectError, InvalidValueError} from "#/utils/errors.js";
import {ProcessCreateError} from "#/services/record/processing.js";
import {$Typed} from "@atproto/api";
import {CID} from 'multiformats/cid'
import {sha256} from 'multiformats/hashes/sha2'
import * as dagCbor from '@ipld/dag-cbor'
import {getTopicTitle} from "#/services/wiki/utils.js";
import {getTopicIdFromTitle} from "@cabildo-abierto/utils";

function untype<T>(obj: $Typed<T> | Omit<$Typed<T>, "$type">): T {

    return Object.fromEntries(
        Object.entries(obj)
            .map(([k, v]) => {
                if(k == "$type") {
                    return null
                } else {
                    if(v instanceof Object){
                        return [k, untype(v)]
                    } else {
                        return [k, v]
                    }
                }
            })
            .filter(x => x != null)
    )
}


export function getPollKey(poll: ArCabildoabiertoEmbedPoll.Poll): Effect.Effect<string, CIDEncodeError> {
    return Effect.tryPromise({
        try: async () => {
            const bytes = dagCbor.encode(untype(poll))
            const hash = await sha256.digest(bytes)
            return CID.create(1, dagCbor.code, hash)
        },
        catch: error => new CIDEncodeError(error)
    }).pipe(
        Effect.map(cid => {
            return cid.toString()
        })
    )
}


export class FetchError {
    readonly _tag = "FetchError"
}

export class ImageNotFoundError {
    readonly _tag = "ImageNotFoundError"
}


export class CIDEncodeError {
    readonly _tag = "CIDEncodeError"
    message: string | undefined
    name: string | undefined
    constructor(error?: unknown) {
        if(error && error instanceof Error) {
            this.message = error.message
            this.name = error.name
        }
    }
}


export class PollIdMismatchError {
    readonly _tag = "PollIdMismatchError"
}


/*function getEmbedsFromEmbedViews(
    agent: SessionAgent,
    embeds?: ArCabildoabiertoWikiEmbed.View[],
    embedContexts?: EmbedContext[]
): Effect.Effect<
    ArCabildoabiertoWikiEmbed.Main[],
    FetchError | ImageNotFoundError | UploadImageFromBase64Error | InvalidValueError | CIDEncodeError | PollIdMismatchError
> {

    return Effect.gen(function* () {
        let embedMains: ArCabildoabiertoWikiEmbed.Main[] = []
        if(embeds){
            for(let i = 0; i < embeds.length; i++){
                const e = embeds[i]
                if(AppBskyEmbedImages.isView(e.value)){
                    if(embedContexts && embedContexts[i]){
                        const context = embedContexts[i]
                        if(context?.base64files){
                            const blobs = yield* Effect.all(
                                context.base64files.map(f => uploadBase64Blob(agent, f)),
                                {concurrency: "unbounded"}
                            )
                            const images: AppBskyEmbedImages.Image[] = []
                            for(let j = 0; j < blobs.length; j++){
                                const b = blobs[j]
                                images.push({
                                    $type: "app.bsky.embed.images#image",
                                    image: b.ref,
                                    alt: ""
                                })
                            }
                            embedMains.push({
                                $type: "ar.cabildoabierto.wiki.embed",
                                value: {
                                    $type: "app.bsky.embed.images",
                                    images
                                },
                                index: e.index
                            })
                        }
                    } else {
                        const images: AppBskyEmbedImages.Image[] = []
                        for(let j = 0; j < e.value.images.length; j++){
                            const img = e.value.images[j]
                            const url = img.fullsize && img.fullsize.length > 0 ? img.fullsize : img.thumb
                            const res = yield* Effect.tryPromise({
                                try: () => fetch(url),
                                catch: () => {
                                    return new FetchError()
                                }
                            })
                            if(!res.ok){
                                return yield* Effect.fail(new ImageNotFoundError())
                            }
                            const arrayBuffer = yield* Effect.tryPromise({
                                try: () => res.blob().then(blob => blob.arrayBuffer()),
                                catch: () => new FetchError()
                            })

                            const buffer = Buffer.from(arrayBuffer);
                            const base64 = buffer.toString('base64');
                            const blobRef = yield* uploadBase64Blob(agent, base64)
                            images.push({
                                $type: "app.bsky.embed.images#image",
                                image: blobRef.ref,
                                alt: ""
                            })
                        }
                        embedMains.push({
                            $type: "ar.cabildoabierto.wiki.embed",
                            value: {
                                $type: "app.bsky.embed.images",
                                images
                            },
                            index: e.index
                        })
                    }
                } else if(ArCabildoabiertoEmbedVisualization.isMain(e.value)){
                    embedMains.push({
                        $type: "ar.cabildoabierto.wiki.embed",
                        value: e.value,
                        index: e.index
                    })
                } else if(ArCabildoabiertoEmbedPoll.isView(e.value)) {
                    embedMains.push({
                        $type: "ar.cabildoabierto.wiki.embed",
                        value: yield* pollViewToMain(e.value),
                        index: e.index
                    })
                } else if(ArCabildoabiertoEmbedPoll.isMain(e.value)) {
                    embedMains.push({
                        $type: "ar.cabildoabierto.wiki.embed",
                        value: e.value,
                        index: e.index
                    })
                } else {
                    yield* Effect.fail(new InvalidValueError("Tipo de embed desconocido."))
                }
            }
        }
        return embedMains
    }).pipe(Effect.withSpan("getEmbedsFromEmbedViews"))
}*/


export class InvalidTopicPropError {
    readonly _tag = "InvalidTopicPropError"
    constructor(readonly prop?: string) {}
}


class TopicTitleRequiredError {
    readonly _tag = "TopicTitleRequiredError"
    constructor() {}
}


export function createTopicVersionATProto(
    agent: SessionAgent,
    {id, props}: CreateTopicVersionProps
): Effect.Effect<RefAndRecord<ArCabildoabiertoWikiTopic.Record>, TopicTitleRequiredError | ATCreateRecordError | UploadStringBlobError | FetchError | ImageNotFoundError | InvalidValueError | UploadImageFromBase64Error | InvalidTopicPropError | PollIdMismatchError | CIDEncodeError> {

    return Effect.gen(function* () {
        let validatedProps: ArCabildoabiertoWikiTopic.TopicProp[] | undefined = undefined
        if(props){
            validatedProps = []
            for(let i = 0; i < props.length; i++){
                const res = ArCabildoabiertoWikiTopic.validateTopicProp(props[i])
                if(!res.success){
                    return yield* Effect.fail(new InvalidTopicPropError(props[i].name))
                } else {
                    validatedProps.push(res.value)
                }
            }
        }
        const title = getTopicTitle({props})
        yield* Effect.annotateCurrentSpan({title})
        if(!id && !title) {
            return yield* Effect.fail(new TopicTitleRequiredError())
        }
        const topicId = id ?? getTopicIdFromTitle(title!)

        const record: ArCabildoabiertoWikiTopic.Record = {
            $type: "ar.cabildoabierto.wiki.topic",
            id: topicId,
            props: validatedProps,
            createdAt: new Date().toISOString(),
        }

        const {data} = yield* Effect.tryPromise({
            try: () => agent.bsky.com.atproto.repo.createRecord({
                repo: agent.did,
                collection: 'ar.cabildoabierto.wiki.topic',
                record: record,
            }),
            catch: () => new ATCreateRecordError()
        })
        return {ref: {uri: data.uri, cid: data.cid}, record}
    }).pipe(
        Effect.withSpan("createTopicVersionATProto", {attributes: {id}})
    )
}


export class TopicAlreadyExistsError {
    readonly _tag = "TopicAlreadyExistsError"
}


function checkTopicNotExists(ctx: AppContext, id: string): Effect.Effect<void, TopicAlreadyExistsError | DBSelectError> {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Topic")
            .select("id")
            .where("id", "ilike", id)
            .where(eb => eb.exists(
                eb
                    .selectFrom("TopicVersion")
                    .whereRef("TopicVersion.topicId", "=", "Topic.id")
            ))
            .executeTakeFirst(),
        catch: (error) => new DBSelectError(error)
    }).pipe(Effect.flatMap(exists => {
        return exists != null ?
            Effect.fail(new TopicAlreadyExistsError()) :
            Effect.void
    }))
}


export const createTopicVersionHandler: EffHandler<CreateTopicVersionProps> = (ctx, agent, params) => {
    return createTopicVersion(ctx, agent, params).pipe(
        Effect.catchAll(error => {
            if(error._tag == "TopicAlreadyExistsError") {
                return Effect.fail("Ya existe un tema con ese nombre.")
            } else {
                return Effect.fail("Ocurrió un error al crear el tema.")
            }
        }),
        Effect.map(() => ({}))
    )
}


export type CreateTopicVersionError = TopicTitleRequiredError | ATCreateRecordError | UploadStringBlobError | FetchError | ImageNotFoundError | UploadImageFromBase64Error | InvalidTopicPropError | DBSelectError | TopicAlreadyExistsError | ProcessCreateError | CIDEncodeError | PollIdMismatchError


export const createTopicVersion = (
    ctx: AppContext,
    agent: SessionAgent,
    params: CreateTopicVersionProps
): Effect.Effect<void, CreateTopicVersionError> => Effect.gen(function* () {
    if(!params.id){
        const title = getTopicTitle({props: params.props})
        if(!title) return yield* Effect.fail(new TopicTitleRequiredError())
        yield* checkTopicNotExists(ctx, title)
    }

    const {ref, record} = yield* createTopicVersionATProto(agent, params)

    yield* processValidatedRecords(ctx, [{ref, record}], topicRecordProcessor)
})