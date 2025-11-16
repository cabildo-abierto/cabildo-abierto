import {ArCabildoabiertoDataDataset} from "@cabildo-abierto/api";

export type RawDatasetView = {
    data: string
    columns: ArCabildoabiertoDataDataset.Column[]
}


export type DatasetForTableView = Omit<
    ArCabildoabiertoDataDataset.DatasetView |
    ArCabildoabiertoDataDataset.TopicsDatasetView |
    RawDatasetView,
    "name" | "uri" | "cid" | "author" | "createdAt"
>


export type DatasetSortOrder = { col: string, order: "asc" | "desc" }