import {AppContext} from "#/setup.js";
import {TextAndFormat} from "#/services/wiki/references/references.js";
import {anyEditorStateToMarkdownOrLexical} from "#/utils/lexical/transforms.js";
import {decompress, getPlainText} from "@cabildo-abierto/editor-core";
import {ArCabildoabiertoFeedArticle, ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"
import {BlobRef} from "#/services/hydration/hydrate.js";
import {getCollectionFromUri, getDidFromUri, isPost} from "@cabildo-abierto/utils";
import {fetchTextBlobs} from "#/services/blob.js";
import {Effect} from "effect";
import {DBError} from "#/services/write/article.js";


export function getNumWords(text: string, format: string) {
    if (format == "markdown" || format == "plain-text") {
        return text.split(" ").length
    } else if (format == "markdown-compressed") {
        return decompress(text).split(" ").length
    } else if (!format || format == "lexical-compressed") {
        return getPlainText(JSON.parse(decompress(text)).root).split(" ").length
    } else if (format == "lexical") {
        return getPlainText(JSON.parse(text).root).split(" ").length
    } else {
        throw Error("No se pudo obtener la cantidad de palabras de un contenido con formato: " + format)
    }
}


export const updateContentsText = (ctx: AppContext, uris?: string[]): Effect.Effect<void, DBError> =>
    Effect.gen(function* () {
    if (uris && uris.length == 0) return
    const batchSize = 50
    let offset = 0
    while (true) {
        const contents = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("Content")
                .innerJoin("Record", "Record.uri", "Content.uri")
                .select(["Content.uri", "textBlobId", "Record.record", "Content.format", "Content.text"])
                .where("Record.collection", "in", longTextCollections)
                .where("text", "is", null)
                .orderBy("Record.created_at", "desc")
                .$if(uris == null, qb => qb.limit(batchSize).offset(offset))
                .$if(uris != null, qb => qb.where("Record.uri", "in", uris!.slice(offset, offset + batchSize)))
                .execute(),
            catch: () => new DBError()
        })
        offset += batchSize

        if (contents.length == 0) break

        const texts = yield* getContentsText(ctx, contents, undefined, false)

        yield* setContentsText(ctx, contents.map(c => c.uri), texts)

        if (contents.length < batchSize) {
            break
        }
    }
})


const setContentsText = (
    ctx: AppContext,
    uris: string[],
    texts: (TextAndFormat | null)[]
): Effect.Effect<void, DBError> => Effect.gen(function* () {
    const values: {
        uri: string
        selfLabels: string[]
        embeds: any[]
        dbFormat: string
        text: string
    }[] = texts.map((t, idx) => {
        if (!t) {
            t = {
                text: "",
                format: "plain-text"
            }
        }
        const res = anyEditorStateToMarkdownOrLexical(
            t.text,
            t.format
        )
        return {
            uri: uris[idx],
            selfLabels: [],
            embeds: [],
            dbFormat: res.format,
            text: res.text
        }
    }).filter(x => x != null)

    if (values.length > 0) {
        yield* Effect.tryPromise({
            try: () => ctx.kysely
                .insertInto("Content")
                .values(values)
                .onConflict((oc) => oc.column("uri").doUpdateSet({
                    text: eb => eb.ref("excluded.text"),
                    dbFormat: eb => eb.ref("excluded.dbFormat")
                }))
                .execute(),
            catch: () => new DBError()
        })
    }
})


export async function updateContentsNumWords(ctx: AppContext) {
    const batchSize = 500
    let offset = 0
    while (true) {
        console.log("updating num words for batch", offset)
        const contents = await ctx.kysely
            .selectFrom("Content")
            .innerJoin("Record", "Record.uri", "Content.uri")
            .select(["Content.uri", "Content.text", "Content.dbFormat"])
            .where("collection", "in", ["ar.cabildoabierto.wiki.topicVersion", "ar.cabildoabierto.feed.article"])
            .where("numWords", "is", null)
            .where("text", "is not", null)
            .limit(batchSize)
            .offset(offset)
            .execute()
        offset += contents.length

        const values = contents.map(c => {
            if (c.text != null) {
                return {
                    uri: c.uri,
                    numWords: getNumWords(c.text, c.dbFormat ?? "lexical-compressed")
                }
            } else {
                return null
            }
        }).filter(x => x != null)

        if (values.length > 0) {
            await ctx.kysely
                .insertInto("Content")
                .values(values.map(v => ({
                    uri: v.uri,
                    numWords: v.numWords,
                    selfLabels: [],
                    embeds: []
                })))
                .onConflict((oc) => oc.column("uri").doUpdateSet({
                    numWords: eb => eb.ref("excluded.numWords"),
                }))
                .execute()
        }

        if (values.length < batchSize) {
            break
        }
    }
}


export const longTextCollections = ["ar.cabildoabierto.feed.article", "ar.cabildoabierto.wiki.topicVersion"]


export async function resetContentsFormat(ctx: AppContext) {
    const batchSize = 2000
    let offset = 0

    while (true) {
        const contents = await ctx.kysely
            .selectFrom("Content")
            .innerJoin("Record", "Record.uri", "Content.uri")
            .select(["Record.record", "Record.uri"])
            .where("Record.collection", "in", longTextCollections)
            .limit(batchSize)
            .offset(offset)
            .execute()
        offset += contents.length

        const values = contents.map(c => {
            const recordStr = c.record
            const record = recordStr ? JSON.parse(recordStr) as ArCabildoabiertoFeedArticle.Record | ArCabildoabiertoWikiTopicVersion.Record : null
            if (!record) {
                console.log("Warning: " + c.uri + " no tiene el registro.")
                return null
            }
            return {
                uri: c.uri,
                format: record.format,
                dbFormat: null,
                text: null,
                embeds: [],
                selfLabels: []
            }
        }).filter(x => x != null)

        if (values.length > 0) {
            await ctx.kysely
                .insertInto("Content")
                .values(values)
                .onConflict((oc) => oc.column("uri").doUpdateSet({
                    format: eb => eb.ref("excluded.format"),
                    text: eb => eb.ref("excluded.text")
                }))
                .execute()
        }

        if (contents.length < batchSize) break
    }

}

export type ContentProps = {
    uri: string
    CAIndexedAt: Date
    text: string | null
    textBlobId?: string | null
    format: string | null
    dbFormat: string | null
    title: string | null
}


type MaybeContent = {
    text?: string | null
    textBlobId?: string | null
    format?: string | null
    dbFormat?: string | null
    uri: string
}


function isCompressed(format: string | null) {
    if (!format) return true
    return ["lexical-compressed", "markdown-compressed"].includes(format)
}


function formatToDecompressed(format: string) {
    return format.replace("compressed", "").replace("-", "")
}


export const getContentsText = (
    ctx: AppContext,
    contents: MaybeContent[],
    retries: number = 10,
    decompressed: boolean = true
): Effect.Effect<(TextAndFormat | null)[]> => Effect.gen(function* () {
    const texts: (TextAndFormat | null)[] = contents.map(_ => null)

    const blobRefs: { i: number, blob: BlobRef }[] = []
    for (let i = 0; i < contents.length; i++) {
        const c = contents[i]
        if (c.text != null) {
            texts[i] = {text: c.text, format: c.dbFormat ?? null}
        } else if (c.textBlobId) {
            blobRefs.push({i, blob: {cid: c.textBlobId, authorId: getDidFromUri(c.uri)}})
        }
    }

    const blobTexts = yield* fetchTextBlobs(ctx, blobRefs.map(x => x.blob), retries)

    for (let i = 0; i < blobRefs.length; i++) {
        const text = blobTexts[i]
        const format = contents[blobRefs[i].i].format
        texts[blobRefs[i].i] = text != null ? {
            text,
            format: format ?? null
        } : null
    }

    if (decompressed) {
        for (let i = 0; i < texts.length; i++) {
            const text = texts[i]
            if (text != null && text.text.length > 0 && !isPost(getCollectionFromUri(contents[i].uri)) && isCompressed(text.format ?? null)) {
                try {
                    texts[i] = {
                        text: decompress(text.text),
                        format: formatToDecompressed(text.format ?? "lexical-compressed")
                    }
                } catch {
                    ctx.logger.pino.error({uri: contents[i].uri}, `error decompressing text`)
                    texts[i] = null
                }
            }
        }
    }

    return texts
})