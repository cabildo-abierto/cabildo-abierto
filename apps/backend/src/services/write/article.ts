import {uploadImageBlob, uploadStringBlob} from "#/services/blob.js";
import {CAHandler} from "#/utils/handler.js";
import {SessionAgent} from "#/utils/session-agent.js";
import {ArCabildoabiertoFeedArticle, CreateArticleProps} from "@cabildo-abierto/api"
import {getEmbedsFromEmbedViews} from "#/services/write/topic.js";
import {ArticleRecordProcessor} from "#/services/sync/event-processing/article.js";
import {getRkeyFromUri} from "@cabildo-abierto/utils";



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
    try {
        const res = await createArticleAT(agent, article)
        if(res.error || !res.ref || !res.record) return {error: res.error}

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

    return {data: {}}
}