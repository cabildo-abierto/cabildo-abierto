import {ArCabildoabiertoDataDataset} from "@cabildo-abierto/api/dist"
import {DatasetFullView} from "@/components/visualizations/editor/datasets/dataset-full-view";


const DatasetPage = ({dataset}: { dataset: ArCabildoabiertoDataDataset.DatasetView }) => {
    return <div className={""}>
        <div className={"mt-8 mb-16 sm:px-0 px-2"}>
            <DatasetFullView
                dataset={{$type: "ar.cabildoabierto.data.dataset#datasetView", ...dataset}}
            />
        </div>
    </div>
}


export default DatasetPage