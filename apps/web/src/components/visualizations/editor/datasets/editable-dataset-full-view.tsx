import {type AnyDatasetView, DatasetFullView} from "./dataset-full-view";
import {$Typed} from "@atproto/api";
import {DatasetEditor} from "./dataset-editor";
import {ArCabildoabiertoDataDataset, ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";


export const EditableDatasetFullView = ({dataset, filters, editing, setEditing}: {
    dataset?: AnyDatasetView
    filters?: $Typed<ArCabildoabiertoEmbedVisualization.ColumnFilter>[]
    editing: boolean
    setEditing: (v: boolean) => void
}) => {
    const editable = !dataset || !ArCabildoabiertoDataDataset.isTopicsDatasetView(dataset)

    if(editing && editable) {
        if(ArCabildoabiertoDataDataset.isDatasetViewBasic(dataset)) {
            return <div className={"py-8"}>
                <LoadingSpinner/>
            </div>
        } else if(ArCabildoabiertoDataDataset.isDatasetView(dataset)){
            return <DatasetEditor
                dataset={dataset}
                filters={filters}
                onCreated={(uri: string) => {setEditing(false)}}
            />
        } else if(!dataset) {
            return <DatasetEditor
                onCreated={(uri: string) => {setEditing(false)}}
            />
        }
    } else {
        return <DatasetFullView
            dataset={dataset}
            filters={filters}
            onClickEdit={editable ? () => {setEditing(true)} : undefined}
        />
    }

}