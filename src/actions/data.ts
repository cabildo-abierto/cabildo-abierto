"use server"
import {getSessionAgent} from "./auth";
import {db} from "../db";
import {DatasetProps, VisualizationProps} from "../app/lib/definitions";
import Papa from 'papaparse';
import {Prisma} from ".prisma/client";
import SortOrder = Prisma.SortOrder;
import JSZip from "jszip";
import {DidResolver} from "@atproto/identity";
import {VisualizationSpec} from "react-vega";
import {datasetQuery, recordQuery, visualizationQuery} from "./utils";


export async function createBlobFromFile(f: File){
    const {agent, did} = await getSessionAgent()
    const headers: Record<string, string> = {
        "Content-Length": f.size.toString()
    }
    const res = await agent.uploadBlob(f, {headers})
}


export async function createDataset(title: string, columns: string[], formData: FormData, format: string): Promise<{error?: string}>{
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


export async function getDatasets(): Promise<DatasetProps[]>{
    const datasets: DatasetProps[] = await db.record.findMany({
        select: {
            ...recordQuery,
            dataset: datasetQuery
        },
        where: {
            collection: "ar.com.cabildoabierto.dataset"
        }
    })
    return datasets.filter((d) => {
        return d.dataset.dataBlocks.length > 0
    })
}


export async function fetchBlob(blob: {cid: string, authorId: string}) {

    const didres: DidResolver = new DidResolver({})
    const doc = await didres.resolve(blob.authorId)
    if (doc && doc.service && doc.service.length > 0 && doc.service[0].serviceEndpoint) {
        const url = doc.service[0].serviceEndpoint + "/xrpc/com.atproto.sync.getBlob?did=" + blob.authorId + "&cid=" + blob.cid
        return await fetch(url)
    }

    return null
}

function transformToISO8601(date: string): string {
    const [year, month, day] = date.split('-');

    // Create a new Date object for the given date in UTC
    const isoDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

    // Return the full ISO 8601 format
    return isoDate.toISOString();
}

export async function getDataset(uri: string){

    let dataset: DatasetProps
    try {
        dataset = await db.record.findUnique({
            select: {
                ...recordQuery,
                dataset: datasetQuery
            },
            where: {
                uri: uri
            }
        })
    } catch (err) {
        console.log("Error getting dataset with uri", uri)
        console.log(err)
        return {error: "Error al obtener el dataset."}
    }

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

            const unzipped = await zip.loadAsync(await uint8Array.arrayBuffer())

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

    /*for(let i = 0; i < data.length; i++){
        if("fecha" in data[i]){
            data[i].fecha = transformToISO8601(data[i].fecha)
        }
    }*/

    return {dataset: dataset, data: data}
}


export async function saveVisualization(spec: VisualizationSpec, preview: FormData){

    const {agent, did} = await getSessionAgent()

    try {

        const data = Object.fromEntries(preview);
        const f = data.data as File

        const headers: Record<string, string> = {
            "Content-Length": f.size.toString()
        }

        const res = await agent.uploadBlob(f, {headers})
        const blob = res.data.blob

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
        console.log("error", err)
        return {error: "Ocurrió un error al guardar la visualización"}
    }

    return {}
}

export async function getVisualizations(){
    const v: VisualizationProps[] = await db.record.findMany({
        select: {
            ...recordQuery,
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
    return v
}





export async function getVisualization(uri: string) {
    const v: VisualizationProps = await db.record.findUnique({
        select: {
            ...recordQuery,
            visualization: visualizationQuery
        },
        where: {
            uri: uri
        }
    })

    return v
}