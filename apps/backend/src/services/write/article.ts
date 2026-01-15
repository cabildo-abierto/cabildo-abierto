import {uploadImageBlob, uploadStringBlob} from "#/services/blob.js";
import {CAHandler} from "#/utils/handler.js";
import {SessionAgent} from "#/utils/session-agent.js";
import {ArCabildoabiertoFeedArticle, CreateArticleProps, CreatePostThreadElement} from "@cabildo-abierto/api"
import {getEmbedsFromEmbedViews} from "#/services/write/topic.js";
import {ArticleRecordProcessor} from "#/services/sync/event-processing/article.js";
import {getRkeyFromUri, splitUri} from "@cabildo-abierto/utils";
import {createPost} from "#/services/write/post.js";
import {getArticlePreviewImage, getArticleSummary} from "#/services/hydration/hydrate.js";
import {BlobRef} from "@atproto/lexicon";
import {getCidFromBlobRef} from "#/services/sync/utils.js";



export const createArticleAT = async (agent: SessionAgent, article: CreateArticleProps) => {
    const did = agent.did
    const text = article.text
    const blobRef = await uploadStringBlob(agent, text)

    const embedMains = await getEmbedsFromEmbedViews(agent, article.embeds, article.embedContexts)
    if(embedMains.error){
        return {error: embedMains.error}
    }

    const preview = article.previewImage ? await uploadImageBlob(agent, article.previewImage) : undefined

    const record: ArCabildoabiertoFeedArticle.Record = {
        "$type": "ar.cabildoabierto.feed.article",
        title: article.title,
        format: article.format,
        text: blobRef,
        createdAt: new Date().toISOString(),
        embeds: embedMains.data,
        labels: article.enDiscusion ? {$type: "com.atproto.label.defs#selfLabels", values: [{val: "ca:en discusión"}]} : undefined,
        description: article.description,
        preview: preview?.ref
    }

    if(!article.uri) {
        const {data} = await agent.bsky.com.atproto.repo.createRecord({
            repo: did,
            collection: 'ar.cabildoabierto.feed.article',
            record: record,
        })
        return {ref: {uri: data.uri, cid: data.cid}, record}
    } else {
        const {data} = await agent.bsky.com.atproto.repo.putRecord({
            repo: did,
            collection: 'ar.cabildoabierto.feed.article',
            rkey: getRkeyFromUri(article.uri),
            record: record,
        })
        return {ref: {uri: data.uri, cid: data.cid}, record}
    }

}

export const createArticle: CAHandler<CreateArticleProps> = async (ctx, agent, article) => {
    let uri: string | undefined
    let previewRef: BlobRef | undefined = undefined
    try {
        const res = await createArticleAT(agent, article)
        if(res.error || !res.ref || !res.record) return {error: res.error}
        uri = res.ref.uri
        previewRef = res.record.preview
        await Promise.all([
            article.draftId ? ctx.kysely
                .deleteFrom("Draft")
                .where("id", "=", article.draftId)
                .execute() : undefined,
            new ArticleRecordProcessor(ctx).processValidated([res])
        ])
    } catch (e) {
        ctx.logger.pino.error({error: e}, "error al publicar arículo")
        return {error: "Ocurrió un error al publicar el artículo."}
    }

    if(article.bskyPostText != null) {
        try {
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

            await createPost(ctx, agent, {
                threadElements: [
                    elem
                ],
                forceEdit: false,
                enDiscusion: false,
            })
        } catch (e) {
            ctx.logger.pino.error({error: e}, "error al publicar el artículo en Bluesky")
            return {error: "El artículo fue creado, pero ocurrió un error al crear la publicación para compartir el artículo."}
        }
    }

    return {data: {}}
}