import {DatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {DatasetFullView} from "@/components/datasets/dataset-full-view";
import {MobileHeader} from "@/components/layout/mobile-header";


const DatasetPage = ({dataset}: {dataset: DatasetView}) => {
    return <div className={""}>
        <MobileHeader/>
        <div className={"mt-8 mb-16 sm:px-0 px-2"}>
        <DatasetFullView dataset={{$type: "ar.cabildoabierto.data.dataset#datasetView", ...dataset}}/>
        </div>
    </div>
}


export default DatasetPage