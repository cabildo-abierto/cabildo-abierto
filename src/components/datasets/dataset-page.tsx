import {DatasetFullView} from "@/components/datasets/dataset-full-view";
import {ArCabildoabiertoDataDataset} from "@/lex-api/index"


const DatasetPage = ({dataset}: {dataset: ArCabildoabiertoDataDataset.DatasetView}) => {
    return <div className={""}>
        <div className={"mt-8 mb-16 sm:px-0 px-2"}>
        <DatasetFullView dataset={{$type: "ar.cabildoabierto.data.dataset#datasetView", ...dataset}}/>
        </div>
    </div>
}


export default DatasetPage