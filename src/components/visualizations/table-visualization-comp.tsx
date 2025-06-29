import {
    Table,
    View as VisualizationView
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {DatasetTableView} from "@/components/datasets/dataset-table-view";
import {isDatasetView, isTopicsDatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {PlotCaption, PlotTitle} from "@/components/visualizations/title";


type TableVisualizationComp = {
    spec: Table
    visualization: VisualizationView
    maxWidth?: number
    maxHeight?: number
}

export const TableVisualizationComp = ({spec, visualization, maxWidth, maxHeight}: TableVisualizationComp) => {

    if(isDatasetView(visualization.dataset) || isTopicsDatasetView(visualization.dataset)) {
        return <div className={"space-y-4"}>
            <PlotTitle title={visualization.title} fontSize={18}/>
            <div className={"max-h-[800px] overflow-y-scroll"}>
                <DatasetTableView dataset={visualization.dataset} columnsConfig={spec.columns}/>
            </div>
            <PlotCaption caption={visualization.caption} fontSize={14}/>
        </div>
    }
}