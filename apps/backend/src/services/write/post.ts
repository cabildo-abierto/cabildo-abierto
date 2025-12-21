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
import {uploadImageBlob} from "#/services/blob.js";
import {CAHandler} from "#/utils/handler.js";
import {getParsedPostContent} from "#/services/write/rich-text.js";
import {PostRecordProcessor} from "#/services/sync/event-processing/post.js";
import {AppContext} from "#/setup.js";
import {deleteRecordAT, deleteRecords} from "#/services/delete.js";
import {getDidFromUri, getRkeyFromUri} from "@cabildo-abierto/utils";
import {RefAndRecord} from "#/services/sync/types.js";

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


async function externalEmbedViewToMain(agent: SessionAgent, embed: AppBskyEmbedExternal.View) {
    const external = embed.external
    if (external.thumb) {
        const {ref} = await uploadImageBlob(agent, {$type: "url", src: external.thumb})
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
}


async function getImagesEmbed(agent: SessionAgent, images: ImagePayloadForPostCreation[]) {
    const blobs = await Promise.all(images.map(image => uploadImageBlob(agent, image)))

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


async function getPostEmbed(agent: SessionAgent, post: CreatePostThreadElement): Promise<AppBskyFeedPost.Record["embed"] | undefined> {
    if (post.selection) {
        return {
            $type: "ar.cabildoabierto.embed.selectionQuote",
            start: post.selection[0],
            end: post.selection[1]
        }
    } else if (post.images && post.images.length > 0) {
        const imagesEmbed = await getImagesEmbed(agent, post.images)
        if (!post.quotedPost) {
            return imagesEmbed
        } else {
            return getRecordWithMedia(post.quotedPost, imagesEmbed)
        }
    } else if (post.externalEmbedView) {
        const externalEmbed = await externalEmbedViewToMain(agent, post.externalEmbedView)
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
}


async function createPostAT({
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
}): Promise<{ ref: ATProtoStrongRef, record: AppBskyFeedPost.Record }> {
    const elem = post.threadElements[index]
    const rt = await getParsedPostContent(agent, elem.text)

    const embed = await getPostEmbed(agent, post.threadElements[index])

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
        const ref = await agent.bsky.post({...record})
        return {ref, record}
    } else {
        const {data} = await agent.bsky.com.atproto.repo.putRecord({
            repo: getDidFromUri(elem.uri),
            collection: 'app.bsky.feed.post',
            rkey: getRkeyFromUri(elem.uri),
            record: record,
        })
        return {ref: {uri: data.uri, cid: data.cid}, record}
    }
}


export async function isContentReferenced(ctx: AppContext, uri: string) {
    const references = await ctx.kysely
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
        .executeTakeFirst()

    if (!references) return {error: "No se encontró la publicación que se está editando."}
    return {
        data: references.reactions || references.replies || references.quotes
    }
}


export const createPost: CAHandler<CreatePostProps, ATProtoStrongRef[]> = async (ctx, agent, post) => {
    ctx.logger.pino.info({post, author: agent.did}, "creating post")
    if (post.threadElements.length == 0) {
        return {error: "Hilo vacío."}
    }
    const elem = post.threadElements[0]
    if (elem.uri) {
        if (post.threadElements.length > 1) {
            return {error: "No es posible editar una publicación y al mismo tiempo crear un hilo."}
        }
        // se está editando un post
        const {data: referenced, error} = await isContentReferenced(ctx, elem.uri)
        if (error) return {error}
        if (referenced) {
            if (!post.forceEdit) {
                return {error: "La publicación ya fue referenciada."}
            }
        } else {
            ctx.logger.pino.info({uri: elem.uri}, "deleting edited post")
            // edición de un post que todavía no fue referenciado
            const {error} = await deleteRecords({ctx, agent, uris: [elem.uri], atproto: true})
            if (error) return {error: "Ocurrió un error al editar."}
            post.threadElements[0].uri = undefined
        }
    }

    let refsAndRecords: RefAndRecord<AppBskyFeedPost.Record>[] = []
    try {
        for (let i = 0; i < post.threadElements.length; i++) {
            const refAndRecord = await createPostAT({
                ctx,
                agent,
                post,
                index: i,
                reply: i > 0 ? {
                    parent: refsAndRecords[refsAndRecords.length-1].ref,
                    root: refsAndRecords[0].ref
                } : undefined
            })
            refsAndRecords.push(refAndRecord)
        }
    } catch (error) {
        ctx.logger.pino.error({error}, "error creating post")
        for (const {ref} of refsAndRecords) {
            ctx.logger.pino.info({ref}, "deleting partial thread")
            await deleteRecordAT(agent, ref.uri)
        }
        return {error: "Ocurrió un error al crear la publicación."}
    }

    await new PostRecordProcessor(ctx).processValidated(refsAndRecords)

    return {data: refsAndRecords.map(r => r.ref)}
}