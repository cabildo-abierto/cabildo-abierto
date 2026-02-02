import {decompress} from "@cabildo-abierto/editor-core";
import {
    ArCabildoabiertoDataDataset,
    ArCabildoabiertoEmbedVisualization,
    ArCabildoabiertoWikiTopicVersion
} from "@cabildo-abierto/api"
import {EffHandlerNoAuth} from "#/utils/handler.js";
import {getDidFromUri, getUri} from "@cabildo-abierto/utils";
import {AppContext} from "#/setup.js";
import {DataPlane, FetchFromBskyError, makeDataPlane} from "#/services/hydration/dataplane.js";
import {listOrderDesc, sortByKey} from "@cabildo-abierto/utils";
import {sql} from "kysely";
import {$Typed} from "@atproto/api";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {getObjectKey} from "#/utils/object.js";
import {Effect} from "effect";
import {DBError} from "#/services/write/article.js";

type TopicProp = ArCabildoabiertoWikiTopicVersion.TopicProp

export const hydrateTopicsDatasetView = (ctx: AppContext, filters: $Typed<ArCabildoabiertoEmbedVisualization.ColumnFilter>[]): Effect.Effect<$Typed<ArCabildoabiertoDataDataset.TopicsDatasetView> | null, never, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane
    const state = dataplane.getState()
    const topics = state.topicsDatasets.get(getObjectKey(filters))
    if(!topics) {
        ctx.logger.pino.warn({filters}, "no se encontró el dataset de temas")
        return null
    }

    let data: string = ""
    let columns: ArCabildoabiertoDataDataset.Column[] = []
    if(topics.length == 0){
        data = JSON.stringify([])
    } else {
        const props = topics[0].props as TopicProp[]
        columns = [{name: "Tema"}, ...(props ? props.map(p => ({
            name: p.name
        })) : [])]
        const rows = topics.map(t => {
            const props = t.props as TopicProp[] | undefined

            const row: Record<string, any> = {
                "Tema": t.id
            }

            if(props){
                props.forEach(p => {
                    const valid = ArCabildoabiertoWikiTopicVersion.validateTopicProp(p)
                    if(valid.success && "value" in valid.value.value){
                        row[p.name] = valid.value.value.value
                    }
                })
            }

            return row
        })
        data = JSON.stringify(rows)
    }

    return {
        $type: "ar.cabildoabierto.data.dataset#topicsDatasetView",
        data,
        columns
    }
})


export class NotFoundError {
    readonly _tag = "NotFoundError"
    constructor(readonly message?: string) {}
}


export class HydrationError {
    readonly _tag = "HydrationError"
}


export const getDataset = (ctx: AppContext, uri: string): Effect.Effect<$Typed<ArCabildoabiertoDataDataset.DatasetView>, DBError | HydrationError | NotFoundError | FetchFromBskyError, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane

    const dataset = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Dataset")
            .select("uri")
            .where("uri", "=", uri)
            .executeTakeFirst(),
        catch: () => new DBError()
    })

    if(!dataset) {
        return yield* Effect.fail(new NotFoundError())
    }

    // No se pueden paralelizar
    yield* dataplane.fetchDatasetsHydrationData([uri])
    yield* dataplane.fetchDatasetContents([uri])

    const view = yield* hydrateDatasetView(ctx, uri)
    if(!view) return yield* Effect.fail(new HydrationError())
    return view
})


export const getDatasetHandler: EffHandlerNoAuth<{
    params: { did: string, collection: string, rkey: string }
}, ArCabildoabiertoDataDataset.DatasetView> = (ctx, agent, {params}) => {
    const {did, collection, rkey} = params
    const uri = getUri(did, collection, rkey)

    return Effect.provideServiceEffect(
        getDataset(ctx, uri)
            .pipe(
                Effect.catchTag("NotFoundError", () => Effect.fail("No se encontró el conjunto de datos.")),
                Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener el conjunto de datos."))
            ),
        DataPlane,
        makeDataPlane(ctx, agent)
    )
}

type TopicDatasetSpec = {
    filters: ArCabildoabiertoEmbedVisualization.Main["filters"]
}

export function stringListIsEmpty(name: string) {
    const type = `ar.cabildoabierto.wiki.topicVersion#stringListProp`
    const wrongTypePath = `$[*] ? (@.name == "${name}" && @.value."$type" != "${type}")`
    const emptyPath = `$[*] ? (@.name == "${name}" && @.value."$type" == "${type}" && @.value.value.size() == 0)`
    const existsPath = `$[*] ? (@.name == "${name}")`

    return sql<boolean>`
        "props" IS NULL
        OR (
            NOT jsonb_path_exists("props", ${existsPath}::jsonpath)
        OR jsonb_path_exists("props", ${wrongTypePath}::jsonpath)
        OR jsonb_path_exists("props", ${emptyPath}::jsonpath)
        )
    `;
}

export function stringListIncludes(name: string, value: string) {
    const type = `ar.cabildoabierto.wiki.topicVersion#stringListProp`
    const path = `$[*] ? (@.name == "${name}" && @.value."$type" == "${type}" && exists(@.value.value[*] ? (@ == "${value}")))`;
    return sql<boolean>`jsonb_path_exists("props", ${path}::jsonpath)`;
}


export function equalFilterCond(name: string, value: string) {
    const isNumber = !isNaN(Number(value))
    let path: string
    if(isNumber){
        path = `$[*] ? (@.name == "${name}" && (@.value.value == ${value} || @.value.value == "${value}"))`
    } else {
        path = `$[*] ? (@.name == "${name}" && @.value.value == "${value}")`
    }
    return sql<boolean>`jsonb_path_exists("props", ${path}::jsonpath)`;
}


export function inFilterCond(name: string, values: string[]) {
    const path = `$[*] ? (@.name == "${name}" && (${values.map(v => `@.value.value == "${v}"`).join(" || ")}))`;
    return sql<boolean>`
        jsonb_path_exists("props", ${path}::jsonpath)
    `;
}



export const getTopicsDatasetHandler: EffHandlerNoAuth<TopicDatasetSpec, ArCabildoabiertoDataDataset.TopicsDatasetView> = (ctx, agent, params) => {
    const filters = params.filters ? params.filters.filter(f => ArCabildoabiertoEmbedVisualization.isColumnFilter(f)): []
    if(filters.length == 0) {
        return Effect.fail("Aplicá al menos un filtro.")
    }

    return Effect.provideServiceEffect(Effect.gen(function* () {
        const dataplane = yield* DataPlane

        yield* dataplane.fetchFilteredTopics([filters])

        const dataset = yield* hydrateTopicsDatasetView(ctx, filters)

        if(!dataset) {
            return yield* Effect.fail("Ocurrió un error al obtener el conjunto de datos.")
        }

        return dataset
    }).pipe(Effect.catchTag("DBError", () => Effect.fail("Ocurrió un error al obtener el conjunto de datos."))), DataPlane, makeDataPlane(ctx, agent))
}


export function getDatasetList(ctx: AppContext) {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Dataset")
            .innerJoin("Record", "Record.uri", "Dataset.uri")
            .select("Record.uri")
            .where("Record.record", "is not", null)
            .where("Record.cid", "is not", null)
            .execute(),
        catch: () => new DBError()
    }).pipe(Effect.map(res => res.map(r => r.uri)))
}


export const hydrateDatasetView = (ctx: AppContext, uri: string): Effect.Effect<$Typed<ArCabildoabiertoDataDataset.DatasetView> | null, never, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane
    const data = dataplane.getState()
    const d = data.datasets.get(uri)
    if(!d) return null

    const basicView = yield* hydrateDatasetViewBasic(ctx, uri)
    if(!basicView) return null

    const content = data.datasetContents.get(uri)

    let rows: any[] = []

    if(content && content.length === d.dataBlocks.length) {
        for(let i = 0; i < content.length; i++) {
            if(d.dataBlocks[i].format == "json-compressed"){
                const json: any[] = JSON.parse(decompress(content[i]))
                rows = [...rows, ...json]
            } else {
                ctx.logger.pino.warn({format: d.dataBlocks[i].format, uri}, "dataset format not supported")
            }
        }
    } else if(content){
        ctx.logger.pino.error(
            {contentLength: content.length, dataBlocksLength: d.dataBlocks.length},
            "data blocks length differ")
    }

    return {
        ...basicView,
        $type: "ar.cabildoabierto.data.dataset#datasetView",
        data: JSON.stringify(rows)
    }
})


export const hydrateDatasetViewBasic = (ctx: AppContext, uri: string): Effect.Effect<ArCabildoabiertoDataDataset.DatasetViewBasic | null, never, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane
    const data = dataplane.getState()
    const d = data.datasets?.get(uri)
    if(!d) return null

    const authorId = getDidFromUri(uri)
    const author = yield* hydrateProfileViewBasic(ctx, authorId)

    if (d && author) {
        return {
            $type: "ar.cabildoabierto.data.dataset#datasetViewBasic",
            name: d.title,
            uri: d.uri,
            cid: d.cid,
            author,
            description: d.description ?? undefined,
            createdAt: new Date(d.created_at).toISOString(),
            columns: d.columns.map(c => ({
                $type: "ar.cabildoabierto.data.dataset#column",
                name: c
            })),
            editedAt: d.editedAt ? d.editedAt.toISOString() : undefined
        }
    }
    return null
})


export const getDatasets: EffHandlerNoAuth<{}, ArCabildoabiertoDataDataset.DatasetViewBasic[]> = (ctx, agent, {}) => {
    return Effect.provideServiceEffect(Effect.gen(function* () {
        const dataplane = yield* DataPlane

        const datasetList: string[] = yield* getDatasetList(ctx)

        yield* dataplane.fetchDatasetsHydrationData(datasetList)

        const views: ArCabildoabiertoDataDataset.DatasetViewBasic[] = (yield* Effect.all(datasetList
            .map(d => hydrateDatasetViewBasic(ctx, d))))
            .filter(v => v != null)

        return sortByKey(views, x => [new Date(x.createdAt).getTime()], listOrderDesc)
    }).pipe(
        Effect.catchTag("DBError", () => Effect.fail("Ocurrió un error al obtener los conjuntos de datos.")),
        Effect.catchTag("FetchFromBskyError", () => Effect.fail("Ocurrió un error al obtener los conjuntos de datos.")),
    ), DataPlane, makeDataPlane(ctx, agent))
}