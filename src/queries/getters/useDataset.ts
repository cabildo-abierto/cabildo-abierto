import {useAPI} from "@/queries/utils";
import {DatasetView, DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {splitUri} from "@/utils/uri";

export function useDatasets() {
    return useAPI<DatasetViewBasic[]>("/datasets", ["datasets"])
}


export function useDataset(uri: string | null) {
    let route: string
    let key: string[] = []
    if(uri){
        const {did, collection, rkey} = splitUri(uri)
        route = `/dataset/${did}/${collection}/${rkey}`
        key = ["dataset", uri]
    }
    return useAPI<DatasetView>(route, key, Infinity, uri != null)
}