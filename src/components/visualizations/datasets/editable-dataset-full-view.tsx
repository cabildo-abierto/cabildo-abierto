import {type AnyDatasetView, DatasetFullView} from "@/components/visualizations/datasets/dataset-full-view";
import {$Typed} from "@atproto/api";
import {ColumnFilter} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {DatasetEditor} from "@/components/visualizations/datasets/dataset-editor";
import {ArCabildoabiertoDataDataset} from "@/lex-api";
import LoadingSpinner from "@/components/layout/base/loading-spinner";


export const EditableDatasetFullView = ({dataset, filters, editing, setEditing}: {
    dataset?: AnyDatasetView
    filters?: $Typed<ColumnFilter>[]
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