"use server"
import {unstable_cache} from "next/cache";
import {datasetQuery, enDiscusionQuery, logTimes, recordQuery, revalidateEverythingTime} from "../utils";
import {DatasetProps, FeedContentProps} from "../../app/lib/definitions";
import {db} from "../../db";
import JSZip from "jszip";
import Papa from 'papaparse';
import {getSessionDid} from "../auth";
import {getUserEngagementInFeed} from "../feed/inicio";
import {addCountersToFeed} from "../feed/utils";
import {fetchBlob} from "../blob";
import {compress, decompress} from "../../components/utils/compression";
import {getDidFromUri, getRkeyFromUri} from "../../components/utils/uri";


function compressData(data: any[]){
    const t1 = Date.now()
    const s = JSON.stringify(data)
    const t2 = Date.now()
    const res = compress(s)
    const t3 = Date.now()
    logTimes("compress dataset", [t1, t2, t3])

    return res

}


function decompressDataset(dataset: {dataset?: DatasetProps, data?: string}){
    const t1 = Date.now()
    const decompressedData = decompress(dataset.data)
    const t2 = Date.now()
    const res = JSON.parse(decompressedData)
    const t3 = Date.now()
    logTimes("decompress dataset", [t1, t2, t3])

    return {dataset: dataset.dataset, data: res}
}


export async function getDataset(uri: string): Promise<{dataset: DatasetProps, data: any[]}> {
    const did = getDidFromUri(uri)
    const rkey = getRkeyFromUri(uri)
    const compressedDataset = await unstable_cache(async () => {
            return await getCompressedDataset(uri)
        },
        ["dataset:"+did+":"+rkey],
        {
            tags: ["dataset:"+did+":"+rkey, "dataset"],
            revalidate: revalidateEverythingTime
        }
    )()

    const dataset = decompressDataset(compressedDataset)

    if(dataset.dataset.dataset.columnValues && "length" in dataset.dataset.dataset.columnValues){
        const m = new Map<string, any[]>()
        dataset.dataset.dataset.columnValues.forEach(({column, values}) => {
            m.set(column, values)
        })

        return {
            ...dataset,
            dataset: {
                ...dataset.dataset,
                dataset: {
                    ...dataset.dataset.dataset,
                    columnValues: m
                }
            }
        }
    } else {
        return dataset
    }
}


export async function getCompressedDataset(uri: string): Promise<{dataset?: DatasetProps, data?: string, error?: string}> {

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
        if(!uint8Array || !uint8Array.ok){
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
        const r: {column: string, values: any[]}[] = []
        s.forEach((v, k) => {
            r.push({column: k, values: Array.from(v).sort()})
        })
        return r
    }

    const datasetWithColumnValues: DatasetProps = {
        ...dataset,
        dataset: {
            ...dataset.dataset,
            columnValues: setValuesToListValues(columnValues)
        }
    }

    return {dataset: datasetWithColumnValues, data: compressData(data)}
}


export async function getDatasets(): Promise<FeedContentProps[]>{
    const did = await getSessionDid()

    let datasets: DatasetProps[] = await unstable_cache(
        async () => {
            return await db.record.findMany({
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
        },
        undefined,
        {
            tags: ["datasets"],
            revalidate: revalidateEverythingTime
        }
    )()

    const engagement = await getUserEngagementInFeed(datasets, did)

    datasets = datasets.filter((d) => {
        return d.dataset.dataBlocks.length > 0
    })

    return addCountersToFeed(datasets, engagement)
}