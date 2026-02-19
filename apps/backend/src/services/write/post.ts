import {SessionAgent} from "#/utils/session-agent.js";
import {$Typed} from "@atproto/api";
import {
    AppBskyEmbedImages,
    AppBskyEmbedExternal,
    AppBskyEmbedRecord,
    AppBskyEmbedRecordWithMedia,
    AppBskyFeedPost,
    ATProtoStrongRef,
    CreatePostProps,
    CreatePostThreadElement,
    ImagePayloadForPostCreation, FastPostReplyProps
} from "@cabildo-abierto/api"
import {
    FetchImageURLError,
    uploadImageBlob, UploadImageBlobError,
    UploadImageFromBase64Error,
    UploadImageFromURLError
} from "#/services/blob.js";
import {EffHandler} from "#/utils/handler.js";
import {getParsedPostContent, ParsePostError} from "#/services/write/rich-text.js";
import {PostRecordProcessor} from "#/services/sync/event-processing/post.js";
import {AppContext} from "#/setup.js";
import {ATDeleteRecordError, deleteRecordAT, deleteRecords} from "#/services/delete.js";
import {getDidFromUri, getRkeyFromUri} from "@cabildo-abierto/utils";
import {RefAndRecord} from "#/services/sync/types.js";
import {Effect} from "effect";
import {ProcessDeleteError} from "#/services/sync/event-processing/delete-processor.js";
import {ATCreateRecordError} from "#/services/wiki/votes.js";

function createQuotePostEmbed(post: ATProtoStrongRef): $Typed<AppBskyEmbedRecord.Main> {
    return {
        $type: "app.bsky.embed.record",
        record: {
            $type: 'com.atproto.repo.strongRef',
            uri: post.uri,
            cid: post.cid
        }
    }
}


function externalEmbedViewToMain(agent: SessionAgent, embed: AppBskyEmbedExternal.View): Effect.Effect<$Typed<AppBskyEmbedExternal.Main>, UploadImageBlobError> {
    return Effect.gen(function* () {
        const external = embed.external
        if (external.thumb) {
            const {ref} = yield* uploadImageBlob(agent, {$type: "url", src: external.thumb})
            return {
                $type: "app.bsky.embed.external",
                external: {
                    title: external.title ?? "",
                    description: external.description ?? "",
                    thumb: ref,
                    uri: external.uri
                }
            }
        } else {
            return {
                $type: "app.bsky.embed.external",
                external: {
                    title: external.title ?? "",
                    description: external.description ?? "",
                    uri: external.uri
                }
            }
        }
    })
}


function getImagesEmbed(agent: SessionAgent, images: ImagePayloadForPostCreation[]): Effect.Effect<$Typed<AppBskyEmbedImages.Main>, UploadImageFromURLError | UploadImageFromBase64Error | FetchImageURLError> {
    return Effect.gen(function* () {
        const blobs = yield* Effect.all(images.map(image => uploadImageBlob(agent, image)), {concurrency: 3})

        const imagesEmbed: AppBskyEmbedImages.Image[] = blobs.map((({ref, size}) => {
            return {
                alt: "",
                image: ref,
                aspectRatio: {
                    width: size.width,
                    height: size.height
                }
            }
        }))

        return {
            $type: "app.bsky.embed.images",
            images: imagesEmbed
        }
    })
}


function getRecordWithMedia(quotedPost: ATProtoStrongRef, media: AppBskyEmbedRecordWithMedia.Main["media"]) {
    return {
        $type: "app.bsky.embed.recordWithMedia",
        record: {
            record: {
                uri: quotedPost.uri,
                cid: quotedPost.cid
            }
        },
        media
    }
}


function getPostEmbed(agent: SessionAgent, post: CreatePostThreadElement): Effect.Effect<AppBskyFeedPost.Record["embed"] | undefined, UploadImageBlobError> {
    return Effect.gen(function* () {
        if (post.selection) {
            return {
                $type: "ar.cabildoabierto.embed.selectionQuote",
                start: post.selection[0],
                end: post.selection[1]
            }
        } else if (post.images && post.images.length > 0) {
            const imagesEmbed = yield* getImagesEmbed(agent, post.images)
            if (!post.quotedPost) {
                return imagesEmbed
            } else {
                return getRecordWithMedia(post.quotedPost, imagesEmbed)
            }
        } else if (post.externalEmbedView) {
            const externalEmbed = yield* externalEmbedViewToMain(agent, post.externalEmbedView)
            if (!post.quotedPost) {
                return externalEmbed
            } else {
                return getRecordWithMedia(post.quotedPost, externalEmbed)
            }
        } else if (post.quotedPost) {
            return createQuotePostEmbed(post.quotedPost)
        } else if (post.visualization) {
            return {
                ...post.visualization,
                $type: "ar.cabildoabierto.embed.visualization"
            }
        }
        return undefined
    }).pipe(Effect.withSpan("getPostEmbed"))
}


function createPostAT({
                                       ctx,
                                       agent,
                                       post,
    index,
    reply
                                   }: {
    ctx: AppContext
    agent: SessionAgent
    post: CreatePostProps,
    index: number
    reply?: FastPostReplyProps
}): Effect.Effect<
    { ref: ATProtoStrongRef, record: AppBskyFeedPost.Record },
    ATCreateRecordError | UploadImageBlobError | ParsePostError
> {
    return Effect.gen(function* () {
        const elem = post.threadElements[index]
        const rt = yield* getParsedPostContent(agent, elem.text)

        const embed = yield* getPostEmbed(agent, post.threadElements[index])

        let record: AppBskyFeedPost.Record = {
            $type: "app.bsky.feed.post",
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString(),
            reply: post.reply ?? reply,
            embed,
            labels: post.enDiscusion && index == 0 ? {
                $type: "com.atproto.label.defs#selfLabels",
                values: [{val: "ca:en discusión"}]
            } : undefined
        }

        if (!elem.uri) {
            const ref = yield* Effect.tryPromise({
                try: () => agent.bsky.post({...record}),
                catch: () => new ATCreateRecordError()
            })
            return {ref, record}
        } else {
            const {data} = yield* Effect.tryPromise({
                try: () => agent.bsky.com.atproto.repo.putRecord({
                    repo: getDidFromUri(elem.uri!),
                    collection: 'app.bsky.feed.post',
                    rkey: getRkeyFromUri(elem.uri!),
                    record: record,
                }),
                catch: () => new ATCreateRecordError()
            })
            return {ref: {uri: data.uri, cid: data.cid}, record}
        }
    }).pipe(
        Effect.withSpan("createPostAT")
    )
}


class CheckContentReferencesError {
    readonly _tag = "CheckContentReferencesError"
}


export class PostNotFoundError {
    readonly _tag = "PostNotFoundError"
}


function isContentReferenced(ctx: AppContext, uri: string): Effect.Effect<boolean, CheckContentReferencesError | PostNotFoundError> {
    return Effect.gen(function* () {
        const references = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("Content")
                .innerJoin("Record", "Content.uri", "Record.uri")
                .select([
                    "Content.uri",
                    eb => eb.exists(eb
                        .selectFrom("Reaction")
                        .select(["uri"])
                        .whereRef("Reaction.subjectId", "=", "Content.uri")
                    ).as("reactions"),
                    eb => eb.exists(eb
                        .selectFrom("Post")
                        .select(["uri"])
                        .whereRef("Post.replyToId", "=", "Content.uri")
                    ).as("replies"),
                    eb => eb.exists(eb
                        .selectFrom("Post")
                        .select(["uri"])
                        .whereRef("Post.quoteToId", "=", "Content.uri")
                    ).as("quotes")
                ])
                .where("Content.uri", "=", uri)
                .executeTakeFirst(),
            catch: () => new CheckContentReferencesError()
        })

        if (!references) return yield* Effect.fail(new PostNotFoundError())
        return Boolean(references.reactions) || Boolean(references.replies) || Boolean(references.quotes)
    }).pipe(Effect.withSpan("isContentReferenced", {attributes: {uri}}))
}


class CannotEditReferencedPostError {
    readonly _tag = "CannotEditReferencedPostError"
}


function preparePostEdit(ctx: AppContext, agent: SessionAgent, post: CreatePostProps, elem: CreatePostThreadElement): Effect.Effect<CreatePostProps, string | CannotEditReferencedPostError | CheckContentReferencesError | PostNotFoundError | ATDeleteRecordError | ProcessDeleteError> {
    return Effect.gen(function* () {
        if (post.threadElements.length > 1) {
            return yield* Effect.fail("No es posible editar una publicación y al mismo tiempo crear un hilo.")
        }
        if(!elem.uri) {
            return post
        }

        const referenced = yield* isContentReferenced(ctx, elem.uri)
        Effect.annotateCurrentSpan({referenced})
        if (referenced) {
            if (!post.forceEdit) {
                return yield* Effect.fail(new CannotEditReferencedPostError())
            }
        } else {
            // edición de un post que todavía no fue referenciado
            yield* deleteRecords({ctx, agent, uris: [elem.uri], atproto: true})
            post.threadElements[0].uri = undefined
        }
        return post
    }).pipe(Effect.withSpan("preparePostEdit", {attributes: {uri: elem.uri}}))
}


export const createPost: EffHandler<CreatePostProps, ATProtoStrongRef[]> = (ctx, agent, post) => {

    return Effect.gen(function* () {
        if (post.threadElements.length == 0) {
            return yield* Effect.fail("El hilo tiene que tener al menos un elemento.")
        }
        const elem = post.threadElements[0]
        if (elem.uri) {
            post = yield* preparePostEdit(ctx, agent, post, elem)
        }

        let refsAndRecords: RefAndRecord<AppBskyFeedPost.Record>[] = []
        for (let i = 0; i < post.threadElements.length; i++) {
            const refAndRecord = yield* createPostAT({
                ctx,
                agent,
                post,
                index: i,
                reply: i > 0 ? {
                    parent: refsAndRecords[refsAndRecords.length-1].ref,
                    root: refsAndRecords[0].ref
                } : undefined
            }).pipe(Effect.catchAll(() => Effect.gen(function* () {
                for (const {ref} of refsAndRecords) {
                    yield* deleteRecordAT(agent, ref.uri)
                }
                return null
            })))
            if(!refAndRecord) return yield* Effect.fail("Ocurrió un error al crear la publicación.")
            refsAndRecords.push(refAndRecord)
        }

        const processor = new PostRecordProcessor(ctx)
        yield* processor.processValidated(refsAndRecords).pipe(Effect.catchAll(() => Effect.fail("La publicación se creó, pero ocurrió un error al procesarla desde Cabildo Abierto.")))

        return refsAndRecords.map(r => r.ref)
    }).pipe(
        Effect.withSpan("createPost", {
            attributes: {
                ...post,
                threadElements: post.threadElements.map(elem => ({
                    ...elem,
                    images: elem.images?.map(image => image.$type)
                }))
            }
        }),
        Effect.catchAll(error => {
            if(typeof error != "string" && error._tag == "PostNotFoundError") {
                return Effect.fail("No se encontró la publicación a editar.")
            } else if(typeof error != "string" && error._tag == "CannotEditReferencedPostError") {
                return Effect.fail("La publicación ya fue referenciada.")
            } else {
                return Effect.fail("Ocurrió un error al crear la publicación.")
            }
        })
    )
}