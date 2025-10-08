import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {DatasetTableView} from "@/components/visualizations/datasets/dataset-table-view";
import {isDatasetView, isTopicsDatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {PlotCaption, PlotTitle} from "@/components/visualizations/title";


type TableVisualizationComp = {
    spec: ArCabildoabiertoEmbedVisualization.Table
    visualization: ArCabildoabiertoEmbedVisualization.View
}

const TableVisualizationComp = ({
    spec,
    visualization
}: TableVisualizationComp) => {

    if ((isDatasetView(visualization.dataset) || isTopicsDatasetView(visualization.dataset)) && visualization.dataset) {
        return <div className={"space-y-4"}>
            <PlotTitle title={visualization.visualization.title} fontSize={18}/>
            <DatasetTableView
                sort={false}
                dataset={visualization.dataset}
                filters={visualization.visualization.filters}
                columnsConfig={spec.columns}
                maxHeight={450}
            />
            <PlotCaption caption={visualization.visualization.caption} fontSize={14}/>
        </div>
    }
}

export default TableVisualizationComp