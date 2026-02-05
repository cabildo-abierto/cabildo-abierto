import {SessionAgent} from "#/utils/session-agent.js";
import {EffHandler} from "#/utils/handler.js";
import {
    ArCabildoabiertoWikiTopicVersion,
    ArCabildoabiertoFeedArticle,
    AppBskyEmbedImages,
    ArCabildoabiertoEmbedVisualization, EmbedContext
} from "@cabildo-abierto/api"
import {
    uploadBase64Blob,
    UploadImageFromBase64Error,
    uploadStringBlob,
    UploadStringBlobError
} from "#/services/blob.js";
import {BlobRef} from "@atproto/lexicon";
import {TopicVersionRecordProcessor} from "#/services/sync/event-processing/topic.js";
import {Effect} from "effect";
import {ATCreateRecordError} from "#/services/wiki/votes.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {AppContext} from "#/setup.js";
import {DBSelectError} from "#/utils/errors.js";


export class FetchError {
    readonly _tag = "FetchError"
}

export class ImageNotFoundError {
    readonly _tag = "ImageNotFoundError"
}


export function getEmbedsFromEmbedViews(agent: SessionAgent, embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[], embedContexts?: EmbedContext[]): Effect.Effect<ArCabildoabiertoFeedArticle.ArticleEmbed[], FetchError | ImageNotFoundError | UploadImageFromBase64Error> {

    return Effect.gen(function* () {
        let embedMains: ArCabildoabiertoFeedArticle.ArticleEmbed[] = []
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
                                $type: "ar.cabildoabierto.feed.article#articleEmbed",
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
                            $type: "ar.cabildoabierto.feed.article#articleEmbed",
                            value: {
                                $type: "app.bsky.embed.images",
                                images
                            },
                            index: e.index
                        })
                    }
                } else if(ArCabildoabiertoEmbedVisualization.isMain(e.value)){
                    embedMains.push({
                        $type: "ar.cabildoabierto.feed.article#articleEmbed",
                        value: e.value,
                        index: e.index
                    })
                }
            }
        }
        return embedMains
    })
}


export class InvalidTopicPropError {
    readonly _tag = "InvalidTopicPropError"
    constructor(readonly prop?: string) {}
}


export function createTopicVersionATProto(agent: SessionAgent, {id, text, format, message, props, embeds, embedContexts, claimsAuthorship}: CreateTopicVersionProps): Effect.Effect<RefAndRecord<ArCabildoabiertoWikiTopicVersion.Record>, ATCreateRecordError | UploadStringBlobError | FetchError | ImageNotFoundError | UploadImageFromBase64Error | InvalidTopicPropError> {

    return Effect.gen(function* () {
        let validatedProps: ArCabildoabiertoWikiTopicVersion.TopicProp[] | undefined = undefined
        if(props){
            validatedProps = []
            for(let i = 0; i < props.length; i++){
                const res = ArCabildoabiertoWikiTopicVersion.validateTopicProp(props[i])
                if(!res.success){
                    return yield* Effect.fail(new InvalidTopicPropError(props[i].name))
                } else {
                    validatedProps.push(res.value)
                }
            }
        }

        let blob: BlobRef | null = null
        if(text){
            blob = yield* uploadStringBlob(agent, text)
        }

        const embedMains = yield* getEmbedsFromEmbedViews(agent, embeds, embedContexts)

        const record: ArCabildoabiertoWikiTopicVersion.Record = {
            $type: "ar.cabildoabierto.wiki.topicVersion",
            text: text && blob ? blob : undefined,
            format,
            message,
            id,
            props: validatedProps,
            createdAt: new Date().toISOString(),
            embeds: embedMains,
            claimsAuthorship: claimsAuthorship
        }

        const {data} = yield* Effect.tryPromise({
            try: () => agent.bsky.com.atproto.repo.createRecord({
                repo: agent.did,
                collection: 'ar.cabildoabierto.wiki.topicVersion',
                record: record,
            }),
            catch: () => new ATCreateRecordError()
        })
        return {ref: {uri: data.uri, cid: data.cid}, record}
    })
}


type CreateTopicVersionProps = {
    id: string
    text?: string
    format?: string,
    props?: ArCabildoabiertoWikiTopicVersion.TopicProp[]
    message?: string,
    claimsAuthorship?: boolean
    embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
    embedContexts?: EmbedContext[]
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
        catch: () => new DBSelectError()
    }).pipe(Effect.flatMap(exists => {
        return exists != null ?
            Effect.fail(new TopicAlreadyExistsError()) :
            Effect.void
    }))
}


export const createTopicVersion: EffHandler<CreateTopicVersionProps> = (ctx, agent, params) => {
    return Effect.gen(function* () {

        if(params.text == undefined){
            yield* checkTopicNotExists(ctx, params.id)
                .pipe(
                    Effect.catchTag("DBSelectError", () => Effect.fail("Error en la conexión")),
                    Effect.catchTag("TopicAlreadyExistsError", () => Effect.fail("Ya existe un tema con ese nombre."))
                )
        }

        const {ref, record} = yield* createTopicVersionATProto(agent, params)
            .pipe(Effect.catchAll(() => Effect.fail("Ocurrió un error al crear la versión del tema.")))

        const processor = new TopicVersionRecordProcessor(ctx)

        yield* processor.processValidated([{ref, record}]).pipe(
            Effect.catchAll(() => Effect.fail("La versión del tema fue creada, pero ocurrió un error al procesarla."))
        )
        return {}
    })
}