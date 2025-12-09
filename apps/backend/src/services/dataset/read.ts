import {decompress} from "@cabildo-abierto/editor-core";
import {
    ArCabildoabiertoDataDataset,
    ArCabildoabiertoEmbedVisualization,
    ArCabildoabiertoWikiTopicVersion
} from "@cabildo-abierto/api"
import {CAHandlerNoAuth} from "#/utils/handler.js";
import {getDidFromUri, getUri} from "@cabildo-abierto/utils";
import {AppContext} from "#/setup.js";
import {Dataplane} from "#/services/hydration/dataplane.js";
import {listOrderDesc, sortByKey} from "@cabildo-abierto/utils";
import {sql} from "kysely";
import {$Typed} from "@atproto/api";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {getObjectKey} from "#/utils/object.js";

type TopicProp = ArCabildoabiertoWikiTopicVersion.TopicProp

export function hydrateTopicsDatasetView(ctx: AppContext, filters: $Typed<ArCabildoabiertoEmbedVisualization.ColumnFilter>[], dataplane: Dataplane): $Typed<ArCabildoabiertoDataDataset.TopicsDatasetView> | null {
    const topics = dataplane.topicsDatasets.get(getObjectKey(filters))
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
}


export async function getDataset(ctx: AppContext, uri: string) {
    const dataplane = new Dataplane(ctx)

    const dataset = await ctx.kysely
        .selectFrom("Dataset")
        .select("uri")
        .where("uri", "=", uri)
        .executeTakeFirst()
    if(!dataset) {
        return {error: "Ocurrió un error al obtener el dataset."}
    }

    // No se pueden paralelizar
    await dataplane.fetchDatasetsHydrationData([uri])
    await dataplane.fetchDatasetContents([uri])

    const view = hydrateDatasetView(ctx, uri, dataplane)
    if(!view) return {error: "Ocurrió un error al obtener el dataset."}
    return {data: view}
}


export const getDatasetHandler: CAHandlerNoAuth<{
    params: { did: string, collection: string, rkey: string }
}, ArCabildoabiertoDataDataset.DatasetView> = async (ctx, agent, {params}) => {
    const {did, collection, rkey} = params
    const uri = getUri(did, collection, rkey)

    return await getDataset(ctx, uri)
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
    return sql<boolean>`
        jsonb_path_exists("props", ${path}::jsonpath)
    `;
}


export function equalFilterCond(name: string, value: string) {
    const isNumber = !isNaN(Number(value))
    let path: string
    if(isNumber){
        path = `$[*] ? (@.name == "${name}" && (@.value.value == ${value} || @.value.value == "${value}"))`
    } else {
        path = `$[*] ? (@.name == "${name}" && @.value.value == "${value}")`
    }
    return sql<boolean>`
        jsonb_path_exists("props", ${path}::jsonpath)
        `;
}


export function inFilterCond(name: string, values: string[]) {
    const path = `$[*] ? (@.name == "${name}" && (${values.map(v => `@.value.value == "${v}"`).join(" || ")}))`;
    return sql<boolean>`
        jsonb_path_exists("props", ${path}::jsonpath)
    `;
}



export const getTopicsDatasetHandler: CAHandlerNoAuth<TopicDatasetSpec, ArCabildoabiertoDataDataset.TopicsDatasetView> = async (ctx, agent, params) => {
    const filters = params.filters ? params.filters.filter(f => ArCabildoabiertoEmbedVisualization.isColumnFilter(f)): []
    if(filters.length == 0) {
        return {error: "Aplicá al menos un filtro."}
    }

    const dataplane = new Dataplane(ctx, agent)

    await dataplane.fetchFilteredTopics([filters])

    const dataset = hydrateTopicsDatasetView(ctx, filters, dataplane)

    if(!dataset) {
        ctx.logger.pino.error("Error getting topics dataset")
        return {error: "Ocurrió un error al obtener el conjunto de datos."}
    }

    return {data: dataset}
}


export async function getDatasetList(ctx: AppContext) {
    const res = await ctx.kysely
        .selectFrom("Dataset")
        .innerJoin("Record", "Record.uri", "Dataset.uri")
        .select("Record.uri")
        .where("Record.record", "is not", null)
        .where("Record.cid", "is not", null)
        .execute()
    return res.map(r => r.uri)
}


export const hydrateDatasetView = (ctx: AppContext, uri: string, data: Dataplane): $Typed<ArCabildoabiertoDataDataset.DatasetView> | null => {
    const d = data.datasets.get(uri)
    if(!d) return null

    const basicView = hydrateDatasetViewBasic(ctx, uri, data)
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
}


export const hydrateDatasetViewBasic = (ctx: AppContext, uri: string, data: Dataplane): ArCabildoabiertoDataDataset.DatasetViewBasic | null => {
    const d = data.datasets?.get(uri)
    if(!d) return null

    const authorId = getDidFromUri(uri)
    const author = hydrateProfileViewBasic(ctx, authorId, data)

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
}


export const getDatasets: CAHandlerNoAuth<{}, ArCabildoabiertoDataDataset.DatasetViewBasic[]> = async (ctx, agent, {}) => {
    const data = new Dataplane(ctx, agent)

    const datasetList: string[] = await getDatasetList(ctx)

    await data.fetchDatasetsHydrationData(datasetList)

    const views: ArCabildoabiertoDataDataset.DatasetViewBasic[] = datasetList
        .map(d => hydrateDatasetViewBasic(ctx, d, data))
        .filter(v => v != null)

    return {data: sortByKey(views, x => [new Date(x.createdAt).getTime()], listOrderDesc)}
}