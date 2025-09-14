import {DatasetFullView} from "@/components/datasets/dataset-full-view";
import {ArCabildoabiertoDataDataset} from "@/lex-api/index"
import {ThreadHeader} from "@/components/thread/thread-header";


const DatasetPage = ({dataset}: {dataset: ArCabildoabiertoDataDataset.DatasetView}) => {
    return <div className={""}>
        <ThreadHeader c={"ar.cabildoabierto.data.dataset"}/>
        <div className={"mt-8 mb-16 sm:px-0 px-2"}>
        <DatasetFullView dataset={{$type: "ar.cabildoabierto.data.dataset#datasetView", ...dataset}}/>
        </div>
    </div>
}


export default DatasetPage