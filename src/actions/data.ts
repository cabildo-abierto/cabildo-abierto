"use server"
import {getSessionAgent, getSessionDid} from "./auth";
import {db} from "../db";
import {DatasetProps, EngagementProps, FeedContentProps, VisualizationProps} from "../app/lib/definitions";
import Papa from 'papaparse';
import JSZip from "jszip";
import {DidResolver} from "@atproto/identity";
import {VisualizationSpec} from "react-vega";
import {
    addCounters,
    datasetQuery,
    enDiscusionQuery,
    recordQuery,
    revalidateEverythingTime,
    visualizationQuery
} from "./utils";
import {addCountersToFeed} from "./feed/utils";
import {unstable_cache} from "next/cache";
import {getDidFromUri, getRkeyFromUri} from "../components/utils/utils";
import {BlobRef} from "@atproto/lexicon";


export async function createBlobFromFile(f: File){
    const {agent, did} = await getSessionAgent()
    const headers: Record<string, string> = {
        "Content-Length": f.size.toString()
    }
    const res = await agent.uploadBlob(f, {headers})
}


export async function createDataset(title: string, columns: string[], description: string, formData: FormData, format: string): Promise<{error?: string}>{
    const data = Object.fromEntries(formData);

    let f = data.data as File

    const {agent, did} = await getSessionAgent()

    const headers: Record<string, string> = {
        "Content-Length": f.size.toString()
    }

    const res = await agent.uploadBlob(f, {headers})
    if(res.success){
        const blob = res.data.blob
        const curDate = new Date().toISOString()

        const record = {
            title: title,
            createdAt: curDate,
            columns: columns.map((c) => ({name: c})),
            description,
            "$type": "ar.com.cabildoabierto.dataset"
        }

        let datasetLink = null
        try {
            const {data} = await agent.com.atproto.repo.createRecord({
                repo: did,
                collection: "ar.com.cabildoabierto.dataset",
                record
            })
            datasetLink = {uri: data.uri, cid: data.cid}
        } catch (e) {
            console.error(e)
            return {error: "No se pudo publicar el dataset."}
        }

        const blockRecord = {
            createdAt: curDate,
            dataset: datasetLink,
            format: format,
            data: {
                ref: blob.ref,
                mimeType: blob.mimeType,
                size: blob.size,
                $type: "blob"
            },
            "$type": "ar.com.cabildoabierto.dataBlock"
        }

        try {
            await agent.com.atproto.repo.createRecord({
                repo: did,
                collection: "ar.com.cabildoabierto.dataBlock",
                record: blockRecord
            })
        } catch (e) {
            console.error(e)
        }
    } else {
        return {error: "No se pudo publicar el dataset."}
    }
    return {}
}


export async function getDatasets(): Promise<FeedContentProps[]>{
    const did = await getSessionDid()

    let datasets: DatasetProps[] = await db.record.findMany({
        select: {
            ...enDiscusionQuery,
            dataset: datasetQuery,
            visualizationsUsing: {
                select: {
                    uri: true
                }
            }
        },
        where: {
            collection: "ar.com.cabildoabierto.dataset"
        }
    })

    datasets = datasets.filter((d) => {
        return d.dataset.dataBlocks.length > 0
    })

    const readyForFeed = addCountersToFeed(datasets, did)

    return readyForFeed
}

export async function getServiceEndpointForDidNoCache(did: string){
    const didres: DidResolver = new DidResolver({})
    const doc = await didres.resolve(did)
    if(doc && doc.service && doc.service.length > 0 && doc.service[0].serviceEndpoint){
        return doc.service[0].serviceEndpoint
    }
    return null
}


export async function getServiceEndpointForDid(did: string){
    return unstable_cache(async () => {
        return await getServiceEndpointForDidNoCache(did)
    },
    ["serviceendpoint:"+did],
    {
        tags: ["serviceendpoint:"+did],
        revalidate: revalidateEverythingTime
    })()
}


export async function fetchBlob(blob: {cid: string, authorId: string}, cache: boolean = true) {
    const t1 = new Date().getTime()
    let serviceEndpoint = await getServiceEndpointForDid(blob.authorId)
    const t2 = new Date().getTime()

    if (serviceEndpoint) {
        const url = serviceEndpoint + "/xrpc/com.atproto.sync.getBlob?did=" + blob.authorId + "&cid=" + blob.cid
        try {
            return await fetch(url, cache ? undefined : {cache: "no-store"})
        } catch (e) {
            console.error("Couldn't fetch blob", blob.cid, blob.authorId)
            return null
        }
    }
    //console.log("couldn't resolve did doc", blob.authorId)
    return null
}


export async function getDataset(uri: string) {
    const did = getDidFromUri(uri)
    const rkey = getRkeyFromUri(uri)
    return await unstable_cache(async () => {
        return await getDatasetNoCache(uri)
    },
        ["dataset:"+did+":"+rkey],
        {
            tags: ["dataset:"+did+":"+rkey, "dataset"],
            revalidate: revalidateEverythingTime
        }
    )()
}


export async function getDatasetNoCache(uri: string){

    let dataset: DatasetProps
    try {
        dataset = await db.record.findUnique({
            select: {
                ...recordQuery,
                dataset: datasetQuery,
                visualizationsUsing: {
                    select: {
                        uri: true
                    }
                }
            },
            where: {
                uri: uri
            }
        })
    } catch (err) {
        return {error: "Ocurrió un error al obtener el dataset."}
    }

    let acumSize = 0
    let data = []
    const blocks = dataset.dataset.dataBlocks
    for(let i = 0; i < blocks.length; i++){
        const blob = blocks[i].blob

        const uint8Array = await fetchBlob(blob)
        if(!uint8Array){
            return {error: "Ocurrió un error al obtener los datos del dataset."}
        }

        let strContent = undefined
        if(blocks[i].format == "zip"){
            const zip = new JSZip();

            const buffer = await uint8Array.arrayBuffer()

            acumSize += buffer.byteLength

            if(acumSize > 1000000){
                return {error: "No podemos mostrar el conjunto de datos porque pesa más de 1mb."}
            }

            const unzipped = await zip.loadAsync(buffer)

            const fileNames = Object.keys(unzipped.files);
            if (fileNames.length === 0) {
                throw new Error('No files found in the zip.');
            }

            strContent = await unzipped.file(fileNames[0])!.async('string')
        } else {
            strContent = await uint8Array.text()
        }

        const parsedData = Papa.parse(strContent, {
            header: true,
            skipEmptyLines: true,
        })

        data = [...data, ...parsedData.data];
    }

    const columnValues = new Map<string, Set<any>>()
    for(let i = 0; i < dataset.dataset.columns.length; i++){
        columnValues.set(dataset.dataset.columns[i], new Set())
    }
    for(let i = 0; i < data.length; i++){
        for(let j = 0; j < dataset.dataset.columns.length; j++){
            const c = dataset.dataset.columns[j]
            columnValues.get(c).add(data[i][c])
        }
    }

    function setValuesToListValues(s: Map<string, Set<any>>){
        const r = new Map<string, any[]>()
        s.forEach((v, k) => {
            r.set(k, Array.from(v).sort())
        })
        return r
    }

    const datasetWithColumnValues: DatasetProps = {...dataset, dataset: {...dataset.dataset, columnValues: setValuesToListValues(columnValues)}}

    return {dataset: datasetWithColumnValues, data: data}
}


export async function saveVisualization(spec: VisualizationSpec, preview: FormData){

    const {agent, did} = await getSessionAgent()

    try {

        const data = Object.fromEntries(preview);
        const f = data.data as File

        const headers: Record<string, string> = {
            "Content-Length": f.size.toString()
        }

        let blob: BlobRef
        try {
            const res = await agent.uploadBlob(f, {headers})
            blob = res.data.blob
        } catch {
            console.error("Error uploading preview")
            return {error: "Ocurrió un error al guardar la visualización."}
        }

        const record = {
            spec: JSON.stringify(spec),
            createdAt: new Date().toISOString(),
            preview: {
                ref: blob.ref,
                mimeType: blob.mimeType,
                size: blob.size,
                $type: "blob"
            },
        }

        await agent.com.atproto.repo.createRecord({
            repo: did,
            collection: "ar.com.cabildoabierto.visualization",
            record: record,
        })
    } catch (err) {
        console.error("error", err)
        return {error: "Ocurrió un error al guardar la visualización."}
    }

    return {}
}

export async function getVisualizations(){
    const did = await getSessionDid()
    let v: FeedContentProps[] = await db.record.findMany({
        select: {
            ...enDiscusionQuery,
            visualization: visualizationQuery
        },
        where: {
            collection: "ar.com.cabildoabierto.visualization",
            visualization: {
                isNot: null
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    v = addCountersToFeed(v, did)

    return v
}


export async function getVisualization(uri: string) {
    return await unstable_cache(async () => {
        return await getVisualizationNoCache(uri)
    }, [uri], {
        tags: [uri, "visualization"],
        revalidate: revalidateEverythingTime
    })()
}


export async function getVisualizationNoCache(uri: string): Promise<{visualization?: VisualizationProps & EngagementProps, error?: string}> {
    try {
        const v: VisualizationProps = await db.record.findUnique({
            select: {
                ...enDiscusionQuery,
                visualization: visualizationQuery,
            },
            where: {
                uri: uri
            }
        })
        return {visualization: addCounters(getDidFromUri(uri), v)}
    } catch (e) {
        return {error: "Error al obtener la visualización"}
    }

}