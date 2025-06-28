import {
    isDatasetDataSource,
    View as VisualizationView,
    Main as Visualization,
    DatasetDataSource, isTwoAxisPlot, isOneAxisPlot, isTopicsDataSource, TopicsDataSource
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {DatasetView, TopicsDatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset"
import {useDataset} from "@/queries/api";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {Button} from "../../../modules/ui-utils/src/button";
import {WriteButtonIcon} from "@/components/icons/write-button-icon";
import {InsertVisualizationModal} from "@/components/writing/write-panel/insert-visualization-modal";
import {useState} from "react";
import {visualizationViewToMain} from "@/components/writing/write-panel/write-post";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {IconButton} from "../../../modules/ui-utils/src/icon-button";
import dynamic from "next/dynamic";
import {useTopicsDataset} from "@/components/visualizations/editor/visualization-editor";
import {$Typed} from "@atproto/api";
import { pxToNumber } from "@/utils/strings";


const TwoAxisPlotComp = dynamic(() => import("@/components/visualizations/two-axis-plot-comp"))


export const ResponsivePlot = ({
                                   visualization,
    maxWidth,
    maxHeight
                               }: {
    visualization: VisualizationView
    maxWidth?: number
    maxHeight?: number
}) => {
    if (isTwoAxisPlot(visualization.spec) || isOneAxisPlot(visualization.spec)) {
        return <TwoAxisPlotComp
            spec={visualization.spec}
            visualization={visualization}
            maxWidth={maxWidth}
            maxHeight={maxHeight}
        />
    }

    return <div className={"text-[var(--text-light)]"}>
        Esta configuración por ahora no está soportada.
    </div>
};


export const Plot = ({
                         visualization,
                         height,
                         width,
                         onEdit,
                         onDelete
                     }: {
    visualization: VisualizationView
    height?: number | string
    width?: number | string
    onEdit?: (v: Visualization) => void
    onDelete?: () => void
}) => {
    const [editing, setEditing] = useState(false)

    return <div style={{height, width}} className={"relative not-article-content"}>
        {(onEdit != null || onDelete != null) && <div
            className={"absolute top-2 right-2 z-10 space-x-2"}
        >
            {onEdit && <Button
                size={"small"}
                startIcon={<WriteButtonIcon/>}
                color={"background-dark2"}
                onClick={() => {
                    setEditing(true)
                }}
                sx={{height: "28px"}}
            >
                Editar
            </Button>}
            {onDelete && <IconButton
                size={"small"}
                color={"background-dark2"}
                onClick={() => {
                    onDelete()
                }}
                sx={{height: "28px"}}
            >
                <DeleteOutlineIcon fontSize={"inherit"}/>
            </IconButton>}
        </div>}
        <ResponsivePlot
            visualization={visualization}
            maxWidth={width ? pxToNumber(width) : undefined}
            maxHeight={height ? pxToNumber(height) : undefined}
        />
        <InsertVisualizationModal
            open={editing}
            onClose={() => {
                setEditing(false)
            }}
            onSave={onEdit}
            initialConfig={visualizationViewToMain(visualization)}
        />
    </div>
};


function getDatasetVisualizationView(visualization: Visualization, dataset: $Typed<DatasetView> | $Typed<TopicsDatasetView>): VisualizationView {
    return {
        ...visualization,
        $type: "ar.cabildoabierto.embed.visualization#view",
        dataset
    }
}


const DatasetPlotFromMain = ({visualization, dataSource, height, width, onEdit, onDelete}: {
    visualization: Visualization
    dataSource: DatasetDataSource
    width?: number | string
    height?: number | string
    onEdit?: (v: Visualization) => void
    onDelete?: () => void
}) => {
    const {data: dataset, isLoading} = useDataset(dataSource.dataset)

    if (isLoading || !dataset) {
        return <div className={"py-4"}><LoadingSpinner/></div>
    }

    const view = getDatasetVisualizationView(visualization, {
        ...dataset,
        $type: "ar.cabildoabierto.data.dataset#datasetView"
    })

    return <Plot visualization={view} width={width} height={height} onEdit={onEdit} onDelete={onDelete}/>
}


const TopicsDatasetPlotFromMain = ({visualization, dataSource, height, width, onEdit, onDelete}: {
    visualization: Visualization
    dataSource: TopicsDataSource
    width?: number | string
    height?: number | string
    onEdit?: (v: Visualization) => void
    onDelete?: () => void
}) => {
    const {data, isLoading} = useTopicsDataset(visualization.filters, true)

    if (isLoading || !data) {
        return <div className={"py-4"}><LoadingSpinner/></div>
    }

    const view = getDatasetVisualizationView(visualization, {
        ...data.data,
        $type: "ar.cabildoabierto.data.dataset#topicsDatasetView"
    })

    return <Plot visualization={view} width={width} height={height} onEdit={onEdit} onDelete={onDelete}/>
}


export const PlotFromVisualizationMain = ({visualization, height, width, onEdit, onDelete}: {
    visualization: Visualization
    height?: number | string
    width?: number | string
    onEdit?: (v: Visualization) => void
    onDelete?: () => void
}) => {
    if (isDatasetDataSource(visualization.dataSource)) {
        return <DatasetPlotFromMain
            visualization={visualization}
            dataSource={visualization.dataSource}
            height={height}
            width={width}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    } else if(isTopicsDataSource(visualization.dataSource)) {
        return <TopicsDatasetPlotFromMain
            visualization={visualization}
            dataSource={visualization.dataSource}
            height={height}
            width={width}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    }
}