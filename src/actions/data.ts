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
import {recordQuery} from "./utils";


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


export async function fetchBlob(blob: {cid: string, authorId: string}) {

    const didres: DidResolver = new DidResolver({})
    const doc = await didres.resolve(blob.authorId)
    if (doc && doc.service && doc.service.length > 0 && doc.service[0].serviceEndpoint) {
        const url = doc.service[0].serviceEndpoint + "/xrpc/com.atproto.sync.getBlob?did=" + blob.authorId + "&cid=" + blob.cid

        const data = await fetch(url)
            .then((response) => {
                const reader = response.body.getReader();
                return new ReadableStream({
                    start(controller) {
                        return pump();
                        function pump() {
                            return reader.read().then(({ done, value }) => {
                                // When no more data needs to be consumed, close the stream
                                if (done) {
                                    controller.close();
                                    return;
                                }
                                // Enqueue the next data chunk into our target stream
                                controller.enqueue(value);
                                return pump();
                            });
                        }
                    },
                });
            })
            // Create a new response out of the stream
            .then((stream) => new Response(stream))
            // Create an object URL for the response
            .then((response) => response.blob())
        return data
    }

    return null
}

export async function getDataset(uri: string){

    let dataset: DatasetProps
    try {
        dataset = await db.record.findUnique({
            select: datasetQuery,
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

    return {dataset: dataset, data: data}
}


export async function saveVisualization(spec: VisualizationSpec){

    const {agent, did} = await getSessionAgent()

    try {
        const record = {
            spec: spec,
            createdAt: new Date().toISOString()
        }

        await agent.com.atproto.repo.createRecord({
            repo: did,
            collection: "ar.com.cabildoabierto.visualization",
            record: record
        })
    } catch (err) {
        return {error: "Ocurrió un error al guardar la visualización"}
    }

    return {}
}

export async function getVisualizations(){
    const v: VisualizationProps[] = await db.record.findMany({
        select: {
            ...recordQuery,
            visualization: {
                select: {
                    spec: true,
                    dataset: {
                        select: {
                            uri: true,
                            dataset: {
                                select: {
                                    title: true
                                }
                            }
                        }
                    }
                }
            }
        },
        where: {
            collection: "ar.com.cabildoabierto.visualization"
        }
    })
    return v
}


export async function getVisualization(uri: string){
    console.log("getting visualization", uri)
    const v: VisualizationProps = await db.record.findUnique({
        select: {
            ...recordQuery,
            visualization: {
                select: {
                    spec: true,
                    dataset: {
                        select: {
                            uri: true,
                            dataset: {
                                select: {
                                    title: true
                                }
                            }
                        }
                    }
                }
            }
        },
        where: {
            uri: uri
        }
    })
    return v
}