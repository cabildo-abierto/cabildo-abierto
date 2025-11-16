import {useAPI} from "@/components/utils/react/queries";
import {splitUri} from "@cabildo-abierto/utils/dist/uri";
import {ArCabildoabiertoDataDataset} from "@cabildo-abierto/api"

export function useDatasets() {
    return useAPI<ArCabildoabiertoDataDataset.DatasetViewBasic[]>("/datasets", ["datasets"])
}


export function useDataset(uri: string | null) {
    let route: string
    let key: string[] = []
    if(uri){
        const {did, collection, rkey} = splitUri(uri)
        route = `/dataset/${did}/${collection}/${rkey}`
        key = ["dataset", uri]
    }
    return useAPI<ArCabildoabiertoDataDataset.DatasetView>(route, key, Infinity, uri != null)
}