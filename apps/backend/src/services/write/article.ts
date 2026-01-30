import {uploadImageBlob, UploadImageBlobError, uploadStringBlob, UploadStringBlobError} from "#/services/blob.js";
import {EffHandler} from "#/utils/handler.js";
import {SessionAgent} from "#/utils/session-agent.js";
import {ArCabildoabiertoFeedArticle, CreateArticleProps, CreatePostThreadElement} from "@cabildo-abierto/api"
import {FetchError, getEmbedsFromEmbedViews, ImageNotFoundError} from "#/services/write/topic.js";
import {ArticleRecordProcessor} from "#/services/sync/event-processing/article.js";
import {getRkeyFromUri, splitUri} from "@cabildo-abierto/utils";
import {createPost} from "#/services/write/post.js";
import {getArticlePreviewImage, getArticleSummary} from "#/services/hydration/hydrate.js";
import {BlobRef} from "@atproto/lexicon";
import {getCidFromBlobRef} from "#/services/sync/utils.js";
import {Effect} from "effect";
import {ATCreateRecordError} from "#/services/wiki/votes.js";
import {RefAndRecord} from "#/services/sync/types.js";


export const createArticleAT = (agent: SessionAgent, article: CreateArticleProps): Effect.Effect<RefAndRecord<ArCabildoabiertoFeedArticle.Record>, ATCreateRecordError | UploadStringBlobError | FetchError | ImageNotFoundError | UploadImageBlobError> => {
    return Effect.gen(function* () {
        const did = agent.did
        const text = article.text
        const blobRef = yield* uploadStringBlob(agent, text)

        const embedMains = yield* getEmbedsFromEmbedViews(agent, article.embeds, article.embedContexts)

        const preview = article.previewImage ? yield* uploadImageBlob(agent, article.previewImage) : undefined

        const record: ArCabildoabiertoFeedArticle.Record = {
            "$type": "ar.cabildoabierto.feed.article",
            title: article.title,
            format: article.format,
            text: blobRef,
            createdAt: new Date().toISOString(),
            embeds: embedMains,
            labels: article.enDiscusion ? {$type: "com.atproto.label.defs#selfLabels", values: [{val: "ca:en discusión"}]} : undefined,
            description: article.description,
            preview: preview?.ref
        }

        if(!article.uri) {
            const {data} = yield* Effect.tryPromise({
                try: () => agent.bsky.com.atproto.repo.createRecord({
                    repo: did,
                    collection: 'ar.cabildoabierto.feed.article',
                    record: record,
                }),
                catch: () => new ATCreateRecordError()
            })
            return {ref: {uri: data.uri, cid: data.cid}, record}
        } else {
            const {data} = yield* Effect.tryPromise({
                try: () => agent.bsky.com.atproto.repo.putRecord({
                    repo: did,
                    collection: 'ar.cabildoabierto.feed.article',
                    rkey: getRkeyFromUri(article.uri!),
                    record: record
                }),
                catch: () => {
                    return new ATCreateRecordError()
                }
            })
            return {ref: {uri: data.uri, cid: data.cid}, record}
        }
    })
}


export class DBError {
    readonly _tag = "DBError"
}


export const createArticle: EffHandler<CreateArticleProps> = (ctx, agent, article) => {
    return Effect.gen(function* () {
        let uri: string | undefined
        let previewRef: BlobRef | undefined

        const res = yield* createArticleAT(agent, article).pipe(
            Effect.catchAll(() => Effect.fail("Ocurrió un error al crear el artículo."))
        )

        uri = res.ref.uri
        previewRef = res.record.preview
        yield* Effect.all([
            article.draftId ? Effect.tryPromise({
                try: () => ctx.kysely
                    .deleteFrom("Draft")
                    .where("id", "=", article.draftId!)
                    .execute(),
                catch: () => new DBError()
            }) : Effect.void,
            new ArticleRecordProcessor(ctx).processValidated([res])
        ], {concurrency: "unbounded"})

        if(article.bskyPostText != null) {
            const {did, rkey} = splitUri(uri)
            const elem: CreatePostThreadElement = {
                text: article.bskyPostText,
                externalEmbedView: {
                    $type: "app.bsky.embed.external#view",
                    external: {
                        uri: `https://cabildoabierto.ar/c/${did}/article/${rkey}`,
                        title: article.title,
                        description: getArticleSummary(article.text, article.format, article.description).summary,
                        thumb: previewRef ? getArticlePreviewImage(did, getCidFromBlobRef(previewRef), article.title)?.thumb : undefined
                    }
                }
            }

            yield* createPost(ctx, agent, {
                threadElements: [
                    elem
                ],
                forceEdit: false,
                enDiscusion: false,
            })
        }

        return {}
    }).pipe(
        Effect.catchTag("DBError", () => {
            return Effect.fail("Ocurrió un error al crear el artículo.")
        }),
        Effect.catchTag("InsertRecordError", () => Effect.fail("El artículo se creó, pero hubo un error al procesarlo.")),
        Effect.catchTag("InvalidValueError", () => Effect.fail("Ocurrió un error al crear el artículo.")),
        Effect.catchTag("UpdateRedisError", () => Effect.fail("Ocurrió un error al crear el artículo.")),
        Effect.catchTag("AddJobsError", () => Effect.fail("Ocurrió un error al crear el artículo."))
    )
}