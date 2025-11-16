import {CAHandler} from "#/utils/handler.js";
import {EmbedContext} from "#/services/write/topic.js";
import {
    ArCabildoabiertoFeedArticle,
    AppBskyEmbedImages
} from "@cabildo-abierto/api"
import {v4 as uuidv4} from "uuid";
import {getArticleSummary} from "#/services/hydration/hydrate.js";
import {sql} from "kysely";
import {FilePayload} from "#/services/storage/storage.js";

export type Draft = {
    text: string
    summary: string
    title?: string
    embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
    embedContexts?: EmbedContext[]
    collection: string
    createdAt: Date
    lastUpdate: Date
    id: string
}


export type DraftPreview = {
    summary: string
    title?: string
    collection: string
    createdAt: Date
    lastUpdate: Date
    id: string
}


type DraftQueryResult = {
    id: string
    created_at: Date
    lastUpdate: Date
    text: string
    embeds: unknown
    collection: string
    title: string | null
}


type EmbedsInDB = {
    embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
    sbPaths?: (string | null)[][]
}


function getDraftEmbedSbUrl(id: string, i: number) {
    return `${id}-${i}-0`
}


function hydrateDraftPreview(d: Omit<DraftQueryResult, "embeds">): DraftPreview | null {
    return {
        id: d.id,
        createdAt: d.created_at,
        lastUpdate: d.lastUpdate,
        collection: d.collection,
        title: d.title ?? undefined,
        summary: getArticleSummary(d.text, "markdown").summary
    }
}


function hydrateDraft(d: DraftQueryResult, signedUrls: Map<string, string>): Draft | null {
    const embeds: EmbedsInDB | null = d.embeds as EmbedsInDB | null

    let embedViews: ArCabildoabiertoFeedArticle.ArticleEmbedView[] | undefined = undefined
    if(embeds && embeds.embeds && embeds.sbPaths && embeds.embeds.length == embeds.sbPaths.length){
        embedViews = []
        for(let i = 0; i < embeds.embeds?.length; i++){
            const e = embeds.embeds[i]
            if(AppBskyEmbedImages.isView(e.value)){
                const sbPath = embeds.sbPaths[i][0]
                if(sbPath == null){
                    embedViews.push(e)
                } else {
                    const imgUrl = signedUrls.get(sbPath)
                    if(!imgUrl) {
                        console.log("Warning: No se encontró el url de una imagen.")
                        continue
                    }
                    embedViews.push({
                        $type: "ar.cabildoabierto.feed.article#articleEmbedView",
                        value: {
                            $type: "app.bsky.embed.images#view",
                            images: e.value.images.map(img => ({
                                $type: "app.bsky.embed.images#viewImage",
                                alt: img.alt,
                                fullsize: imgUrl,
                                thumb: imgUrl
                            }))
                        },
                        index: e.index
                    })
                }
            } else {
                embedViews.push(e)
            }
        }
    }

    return {
        id: d.id,
        createdAt: d.created_at,
        lastUpdate: d.lastUpdate,
        text: d.text,
        embeds: embedViews,
        collection: d.collection,
        title: d.title ?? undefined,
        summary: getArticleSummary(d.text, "markdown").summary
    }
}

export const getDrafts: CAHandler<{}, DraftPreview[]> = async (ctx, agent, {}) => {
    const drafts: Omit<DraftQueryResult, "embeds">[] = await ctx.kysely
        .selectFrom("Draft")
        .select(["id", "created_at", "lastUpdate", "text", "collection", "title"])
        .where("authorId", "=", agent.did)
        .execute()


    return {data: drafts.map(d => hydrateDraftPreview(d)).filter(x => x != null)}
}


export const getDraft: CAHandler<{params: {id: string}}, Draft> = async (ctx, agent, {params}) => {
    const res: DraftQueryResult[] = await ctx.kysely
        .selectFrom("Draft")
        .select(["id", "created_at", "lastUpdate", "text", "embeds", "collection", "title"])
        .where("authorId", "=", agent.did)
        .where("id", "=", params.id)
        .execute()

    if(res.length == 0){
        return {error: "No se encontró el borrador."}
    }

    const draft = res[0]
    const signedUrls = new Map<string, string>()
    if(draft.embeds){
        const embeds = draft.embeds as EmbedsInDB
        if(embeds.sbPaths){
            const sbPaths = embeds.sbPaths.flat().filter(x => x != null)
            const {data} = await ctx.storage!.getSignedUrlsFromPaths(sbPaths, "draft-embeds")
            if(data){
                data.forEach((r, i) => {
                    signedUrls.set(sbPaths[i], r)
                })
            }
        }
    }

    const hydratedDraft = hydrateDraft(draft, signedUrls)
    if(!hydratedDraft){
        return {error: "Ocurrió un error al obtener el borrador."}
    }
    return {data: hydratedDraft}
}



type CreateDraftParams = {
    collection: "ar.cabildoabierto.feed.article" | "app.bsky.feed.post"
    text: string
    title: string
    embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
    embedContexts?: EmbedContext[]
    id?: string
}


export const saveDraft: CAHandler<CreateDraftParams, {id: string}> = async (ctx, agent, params) => {
    const id = params.id ? params.id : uuidv4()

    let embeds: string | undefined = undefined
    if(params.embeds){
        if(!params.embedContexts || params.embedContexts.length != params.embeds.length){
            return {error: "Ocurrió un error al guardar el borrador."}
        }
        let sbPaths: (string | null)[][] = []
        for(let i = 0; i < params.embedContexts.length; i++){
            const e = params.embedContexts[i]
            const embedPaths: (string | null)[] = []
            if(e?.base64files && e.base64files.length > 0){
                const file: FilePayload = {
                    fileName: getDraftEmbedSbUrl(id, i),
                    base64: e.base64files[0]
                }
                const {path, error} = await ctx.storage!.upload(file, "draft-embeds")
                if(error){
                    return {error: "Ocurrió un error al guardar el borrador"}
                }
                if(path){
                    embedPaths.push(path)
                }
            } else {
                embedPaths.push(null)
            }
            sbPaths.push(embedPaths)
        }
        embeds = JSON.stringify({
            sbPaths: sbPaths,
            embeds: params.embeds
        })
    }

    await ctx.kysely
        .insertInto("Draft")
        .values([{
            id: id,
            text: params.text,
            embeds: embeds,
            title: params.title,
            collection: params.collection,
            lastUpdate: new Date(),
            created_at: new Date(),
            authorId: agent.did,
        }])
        .onConflict((oc) => oc.column("id").doUpdateSet({
            collection: eb => eb.ref("excluded.collection"), // no debería cambiar pero bueno
            lastUpdate: eb => eb.ref("excluded.lastUpdate"),
            text: eb => eb.ref("excluded.text"),
            title: eb => eb.ref("excluded.title"),
            embeds: sql`excluded.embeds`,
        }))
        .execute()

    return {
        data: {id}
    }
}