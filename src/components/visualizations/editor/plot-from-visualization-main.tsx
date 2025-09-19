import { DatasetPlotFromMain, TopicsDatasetPlotFromMain } from "../plot"
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api"


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