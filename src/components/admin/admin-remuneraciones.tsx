import {useActivityStats} from "@/queries/admin";
import {DatasetForTableView, DatasetTableView} from "@/components/datasets/dataset-table-view";


export const AdminRemuneraciones = () => {
    const {data} = useActivityStats()

    const dataset: DatasetForTableView | null = data ? {
        data: JSON.stringify(data),
        columns: ["did", "handle", "articles", "topicVersions", "enDiscusion", "income"].map(c => ({
            name: c
        }))
    } : null

    const columnsConfig = data ? ["handle", "income", "articles", "topicVersions", "enDiscusion"].map(c => ({
            columnName: c
        })) : null

    return <div>
        {dataset && <DatasetTableView dataset={dataset} columnsConfig={columnsConfig} />}
    </div>
}