import {EffHandler} from "#/utils/handler.js";
import {
    ArCabildoabiertoFeedArticle,
    AppBskyEmbedImages, CreateDraftParams, DraftPreview, Draft
} from "@cabildo-abierto/api"
import {v4 as uuidv4} from "uuid";
import {getArticleSummary} from "#/services/hydration/hydrate.js";
import {sql} from "kysely";
import {FilePayload} from "@cabildo-abierto/api";
import {DataPlane, makeDataPlane} from "#/services/hydration/dataplane.js";
import {AppContext} from "#/setup.js";
import {SessionAgent} from "#/utils/session-agent.js";
import {Effect} from "effect";
import {DBError} from "#/services/write/article.js";
import {S3GetSignedURLError} from "#/services/storage/storage.js";


type DraftQueryResult = {
    id: string
    created_at: Date
    lastUpdate: Date
    text: string
    embeds: unknown
    collection: string
    title: string | null
    previewImage: string | null
    description: string | null
}


type EmbedsInDB = {
    embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
    sbPaths?: (string | null)[][]
}


function getDraftEmbedSbUrl(id: string, i: number | "preview") {
    return `${id}-${i}-0`
}

const hydrateDraftPreview = (d: Omit<DraftQueryResult, "embeds">): Effect.Effect<DraftPreview | null, never, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane
    const signedUrls = dataplane.getState().signedStorageUrls.get("draft-embeds")
    return {
        id: d.id,
        createdAt: d.created_at,
        lastUpdate: d.lastUpdate,
        collection: d.collection,
        title: d.title ?? undefined,
        summary: getArticleSummary(d.text, "markdown", d.description ?? undefined).summary,
        previewImage: d.previewImage ? signedUrls?.get(d.previewImage) : undefined,
    }
})


const hydrateDraft = (d: DraftQueryResult, signedUrls: Map<string, string>): Effect.Effect<Draft | null, never, DataPlane> => Effect.gen(function* () {
    const embeds: EmbedsInDB | null = d.embeds as EmbedsInDB | null

    let embedViews: ArCabildoabiertoFeedArticle.ArticleEmbedView[] | undefined = undefined
    if (embeds && embeds.embeds && embeds.sbPaths && embeds.embeds.length == embeds.sbPaths.length) {
        embedViews = []
        for (let i = 0; i < embeds.embeds?.length; i++) {
            const e = embeds.embeds[i]
            if (AppBskyEmbedImages.isView(e.value)) {
                const sbPath = embeds.sbPaths[i][0]
                if (sbPath == null) {
                    embedViews.push(e)
                } else {
                    const imgUrl = signedUrls.get(sbPath)
                    if (!imgUrl) {
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

    const dataplane = yield* DataPlane

    return {
        id: d.id,
        createdAt: d.created_at,
        lastUpdate: d.lastUpdate,
        text: d.text,
        embeds: embedViews,
        collection: d.collection,
        title: d.title ?? undefined,
        summary: getArticleSummary(d.text, "markdown", d.description ?? undefined).summary,
        previewImage: d.previewImage ? dataplane.getState().signedStorageUrls.get("draft-embeds")?.get(d.previewImage) : undefined
    }
})


export const getDrafts: EffHandler<{}, DraftPreview[]> = (
    ctx, agent, {}
) => Effect.provideServiceEffect(Effect.gen(function* () {

    const drafts: Omit<DraftQueryResult, "embeds">[] = yield* Effect.tryPromise({
        try: () => ctx.kysely
        .selectFrom("Draft")
        .select([
            "id",
            "created_at",
            "lastUpdate",
            "text",
            "collection",
            "title",
            "description",
            "previewImage"
        ])
        .where("authorId", "=", agent.did)
        .execute(),
        catch: () => new DBError()
    })

    const dataplane = yield* DataPlane

    yield* dataplane.fetchSignedStorageUrls(drafts.map(d => d.previewImage).filter(x => x != null), "draft-embeds")

    const res = yield* Effect.all(drafts.map(d => hydrateDraftPreview(d)))

    return res.filter(x => x != null)
}).pipe(Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener los borradores."))), DataPlane, makeDataPlane(ctx, agent))


export const getDraft: EffHandler<{ params: { id: string } }, Draft> = (
    ctx,
    agent,
    {params}
) => Effect.provideServiceEffect(Effect.gen(function* () {

    const res: DraftQueryResult[] = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Draft")
            .select([
                "id",
                "created_at",
                "lastUpdate",
                "text",
                "embeds",
                "collection",
                "title",
                "description",
                "previewImage"
            ])
            .where("authorId", "=", agent.did)
            .where("id", "=", params.id)
            .execute(),
        catch: () => new DBError()
    })

    if (res.length == 0) {
        return yield* Effect.fail("No se encontró el borrador.")
    }

    const draft = res[0]
    const signedUrls = new Map<string, string>()
    if (draft.embeds) {
        const embeds = draft.embeds as EmbedsInDB
        if (embeds.sbPaths) {
            const sbPaths = embeds.sbPaths.flat().filter(x => x != null)
            const {data} = yield* Effect.tryPromise({
                try: () => ctx.storage!.getSignedUrlsFromPaths(sbPaths, "draft-embeds"),
                catch: () => new S3GetSignedURLError()
            })
            if (data) {
                data.forEach((r, i) => {
                    signedUrls.set(sbPaths[i], r)
                })
            }
        }
    }

    const dataplane = yield* DataPlane

    if (draft.previewImage) {
        yield* dataplane.fetchSignedStorageUrls([draft.previewImage], "draft-embeds")
    }

    const hydratedDraft = yield* hydrateDraft(draft, signedUrls)
    if (!hydratedDraft) {
        return yield* Effect.fail("Ocurrió un error al obtener el borrador.")
    }
    return hydratedDraft
}).pipe(Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener el borrador."))), DataPlane, makeDataPlane(ctx, agent))


class StoreDraftEmbedsError {
    readonly _tag = "StoreDraftEmbedsError"
}


function storeDraftEmbeds(ctx: AppContext, params: CreateDraftParams, draftId: string): Effect.Effect<string | null, StoreDraftEmbedsError> {
    return Effect.gen(function* () {
        if (params.embeds) {
            if (!params.embedContexts || params.embedContexts.length != params.embeds.length) {
                return yield* Effect.fail(new StoreDraftEmbedsError())
            }

            let sbPaths: (string | null)[][] = []
            for (let i = 0; i < params.embedContexts.length; i++) {
                const e = params.embedContexts[i]
                const embedPaths: (string | null)[] = []
                if (e?.base64files && e.base64files.length > 0) {
                    const file: FilePayload = {
                        fileName: getDraftEmbedSbUrl(draftId, i),
                        base64: e.base64files[0]
                    }
                    const {path, error} = yield* Effect.promise(() => ctx.storage!.upload(file, "draft-embeds"))
                    if (error) {
                        return yield* Effect.fail(new StoreDraftEmbedsError())
                    }
                    if (path) {
                        embedPaths.push(path)
                    }
                } else {
                    embedPaths.push(null)
                }
                sbPaths.push(embedPaths)
            }
            return JSON.stringify({
                sbPaths: sbPaths,
                embeds: params.embeds
            })
        }
        return null

    })

}


class StoreDraftPreviewImageError {
    readonly _tag = "StoreDraftPreviewImageError"

    constructor(readonly message: string) {
    }
}


function storePreviewImage(ctx: AppContext, params: CreateDraftParams, id: string): Effect.Effect<string | null, StoreDraftPreviewImageError> {
    return Effect.gen(function* () {
        if (params.previewImage) {
            if (params.previewImage.$type == "file") {
                const file: FilePayload = {
                    fileName: getDraftEmbedSbUrl(id, "preview"),
                    base64: params.previewImage.base64
                }
                const {path, error} = yield* Effect.promise(() => ctx.storage!.upload(file, "draft-embeds"))

                if (path && !error) {
                    return path
                } else {
                    return yield* Effect.fail(new StoreDraftPreviewImageError("upload error"))
                }
            } else {
                return yield* Effect.fail(new StoreDraftPreviewImageError("should be a file, not url"))
            }
        } else {
            return null
        }
    })
}


export const saveDraft: EffHandler<CreateDraftParams, { id: string }> = (ctx, agent, params) => {

    return Effect.gen(function* () {
        const id = params.id ? params.id : uuidv4()
        const embeds: string | null = yield* storeDraftEmbeds(ctx, params, id)

        const previewImage = yield* storePreviewImage(ctx, params, id)

        yield* Effect.tryPromise({
            try: () => ctx.kysely
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
                    previewImage,
                    description: params.description
                }])
                .onConflict((oc) => oc.column("id").doUpdateSet({
                    collection: eb => eb.ref("excluded.collection"), // no debería cambiar pero bueno
                    lastUpdate: eb => eb.ref("excluded.lastUpdate"),
                    text: eb => eb.ref("excluded.text"),
                    title: eb => eb.ref("excluded.title"),
                    embeds: sql`excluded.embeds`,
                    description: eb => eb.ref("excluded.description"),
                    previewImage: eb => eb.ref("excluded.previewImage")
                }))
                .execute(),
            catch: error => {
                return "Ocurrió un error al guardar el borrador."
            }
        })

        return {id}
    }).pipe(
        Effect.catchTag("StoreDraftPreviewImageError", e => Effect.fail(`Ocurrió un error al guardar la imagen de la vista previa.`)),
        Effect.catchTag("StoreDraftEmbedsError", e => Effect.fail("Ocurrió un error al guardar un adjunto.")),
        Effect.withSpan("saveDraft", {
            attributes: {
                draftId: params.id,
                collection: params.collection,
                embedCount: params.embeds?.length ?? 0,
                previewImage: params.previewImage != null,
                title: params.title,
                description: params.description,
                textLength: params.text.length,
                embedContexts: params.embedContexts?.length ?? 0
            }
        })
    )
}


export async function deleteDraft(ctx: AppContext, agent: SessionAgent, id: string) {
    return ctx.kysely.deleteFrom("Draft")
        .where("id", "=", id)
        .where("authorId", "=", agent.did)
        .execute()
}