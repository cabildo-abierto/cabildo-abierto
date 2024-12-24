"use server"
import {getSessionAgent} from "./auth";
import {db} from "../db";
import {DatasetProps} from "../app/lib/definitions";
import Papa from 'papaparse';
import {Prisma} from ".prisma/client";
import SortOrder = Prisma.SortOrder;
import JSZip from "jszip";


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


const recordQuery = {
    uri: true,
    cid: true,
    collection: true,
    createdAt: true,
    author: {
        select: {
            did: true,
            handle: true,
            displayName: true,
            avatar: true
        }
    }
}

const datasetQuery = {
    ...recordQuery,
    dataset: {
        select: {
            title: true,
            columns: true,
            dataBlocks: {
                select: {
                    record: {
                        select: recordQuery
                    },
                    format: true,
                    blob: {
                        select: {
                            cid: true,
                            authorId: true
                        }
                    }
                },
                orderBy: {
                    record: {
                        createdAt: "asc" as SortOrder
                    }
                }
            }
        }
    }
}

export async function getDatasets(): Promise<DatasetProps[]>{
    const datasets: DatasetProps[] = await db.record.findMany({
        select: datasetQuery,
        where: {
            collection: "ar.com.cabildoabierto.dataset"
        }
    })
    return datasets.filter((d) => {
        return d.dataset.dataBlocks.length > 0
    })
}


export async function getDataset(cid: string){
    const dataset: DatasetProps = await db.record.findUnique({
        select: datasetQuery,
        where: {
            cid: cid
        }
    })
    const {agent} = await getSessionAgent()
    let data = []
    const blocks = dataset.dataset.dataBlocks
    for(let i = 0; i < blocks.length; i++){
        const blob = blocks[i].blob
        const {data: uint8Array} = await agent.com.atproto.sync.getBlob({did: blob.authorId, cid: blob.cid})

        let strContent = undefined
        if(blocks[i].format == "zip"){
            const zip = new JSZip();

            const unzipped = await zip.loadAsync(uint8Array);

            const fileNames = Object.keys(unzipped.files);
            if (fileNames.length === 0) {
                throw new Error('No files found in the zip.');
            }

            strContent = await unzipped.file(fileNames[0])!.async('string')
        } else {
            strContent = uint8Array.toString()
        }

        const parsedData = Papa.parse(strContent, {
            header: true,
            skipEmptyLines: true,
        })

        data = [...data, ...parsedData.data];
    }

    return {dataset, data: data}
}