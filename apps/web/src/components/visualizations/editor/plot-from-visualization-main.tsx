import PlotWithButtons from "./plot-with-buttons"
import {ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api"
import {useDataset} from "@/queries/getters/useDataset";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {useTopicsDataset} from "./visualization-editor";
import {getDatasetVisualizationView} from "@/components/visualizations/visualization";


export const TopicsDatasetPlotFromMain = ({visualization, dataSource, height, width, onEdit, onDelete}: {
    visualization: ArCabildoabiertoEmbedVisualization.Main
    dataSource: ArCabildoabiertoEmbedVisualization.TopicsDataSource
    width?: number | string
    height?: number | string
    onEdit?: (v: ArCabildoabiertoEmbedVisualization.Main) => void
    onDelete?: () => void
}) => {
    const {data, isLoading} = useTopicsDataset(visualization.filters, true)

    if (isLoading) {
        return <div className={"py-4"}><LoadingSpinner/></div>
    } else if (!data) {
        return null
    }

    const view = getDatasetVisualizationView(visualization, {
        ...data.data,
        $type: "ar.cabildoabierto.data.dataset#topicsDatasetView"
    })

    return <PlotWithButtons
        visualization={view}
        width={width}
        height={height}
        onEdit={onEdit}
        onDelete={onDelete}
    />
}


export const DatasetPlotFromMain = ({visualization, dataSource, height, width, onEdit, onDelete}: {
    visualization: ArCabildoabiertoEmbedVisualization.Main
    dataSource: ArCabildoabiertoEmbedVisualization.DatasetDataSource
    width?: number | string
    height?: number | string
    onEdit?: (v: ArCabildoabiertoEmbedVisualization.Main) => void
    onDelete?: () => void
}) => {
    const {data: dataset, isLoading} = useDataset(dataSource.dataset)

    const view = getDatasetVisualizationView(visualization, {
        ...dataset,
        $type: "ar.cabildoabierto.data.dataset#datasetView"
    })

    return <PlotWithButtons
        visualization={view}
        loadingDataset={isLoading}
        width={width}
        height={height}
        onEdit={onEdit}
        onDelete={onDelete}
    />
}

const PlotFromVisualizationMain = ({
                                       visualization,
                                       height,
                                       width,
                                       onEdit,
                                       onDelete
                                   }: {
    visualization: ArCabildoabiertoEmbedVisualization.Main
    height?: number | string
    width?: number | string
    onEdit?: (v: ArCabildoabiertoEmbedVisualization.Main) => void
    onDelete?: () => void
}) => {
    if (ArCabildoabiertoEmbedVisualization.isDatasetDataSource(visualization.dataSource)) {
        return <DatasetPlotFromMain
            visualization={visualization}
            dataSource={visualization.dataSource}
            height={height}
            width={width}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    } else if (ArCabildoabiertoEmbedVisualization.isTopicsDataSource(visualization.dataSource)) {
        return <TopicsDatasetPlotFromMain
            visualization={visualization}
            dataSource={visualization.dataSource}
            height={height}
            width={width}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    }
    return null
}


export default PlotFromVisualizationMain