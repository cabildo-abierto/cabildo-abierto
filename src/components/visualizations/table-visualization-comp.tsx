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
}

const TableVisualizationComp = ({
    spec,
    visualization
}: TableVisualizationComp) => {

    if (isDatasetView(visualization.dataset) || isTopicsDatasetView(visualization.dataset)) {
        return <div className={"space-y-4"}>
            <PlotTitle title={visualization.visualization.title} fontSize={18}/>
            <DatasetTableView sort={false} dataset={visualization.dataset} columnsConfig={spec.columns}
                              maxHeight={450}/>
            <PlotCaption caption={visualization.visualization.caption} fontSize={14}/>
        </div>
    }
}

export default TableVisualizationComp