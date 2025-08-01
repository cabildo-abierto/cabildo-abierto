import {
    isDatasetDataSource,
    View as VisualizationView,
    Main as Visualization,
    DatasetDataSource, isTwoAxisPlot, isOneAxisPlot, isTopicsDataSource, TopicsDataSource, isTable
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {
    DatasetView,
    isDatasetView,
    isTopicsDatasetView,
    TopicsDatasetView
} from "@/lex-api/types/ar/cabildoabierto/data/dataset"
import {useDataset} from "@/queries/useDataset";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {WriteButtonIcon} from "@/components/icons/write-button-icon";
import {useState} from "react";
import {visualizationViewToMain} from "@/components/writing/write-panel/write-post";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {IconButton} from "../../../modules/ui-utils/src/icon-button";
import dynamic from "next/dynamic";
import {useTopicsDataset} from "@/components/visualizations/editor/visualization-editor";
import {$Typed} from "@atproto/api";
import {pxToNumber} from "@/utils/strings";
import TableVisualizationComp from "@/components/visualizations/table-visualization-comp";
import {ClickableModalOnClick} from "../../../modules/ui-utils/src/popover";
import {Authorship} from "@/components/feed/frame/authorship";
import {DateSince} from "../../../modules/ui-utils/src/date";
import {contentUrl} from "@/utils/uri";
import {ChooseDatasetPanelFiltersConfig} from "@/components/visualizations/editor/choose-dataset";


const TwoAxisPlotComp = dynamic(() => import("@/components/visualizations/two-axis-plot-comp"))
const InsertVisualizationModal = dynamic(() => import("@/components/writing/write-panel/insert-visualization-modal"))

export const ResponsivePlot = ({
                                   visualization,
                                   maxWidth,
                                   maxHeight
                               }: {
    visualization: VisualizationView
    maxWidth?: number
    maxHeight?: number
}) => {
    if (isTwoAxisPlot(visualization.visualization.spec) || isOneAxisPlot(visualization.visualization.spec)) {
        return <TwoAxisPlotComp
            spec={visualization.visualization.spec}
            visualization={visualization}
            maxWidth={maxWidth}
            maxHeight={maxHeight}
        />
    } else if (isTable(visualization.visualization.spec)) {
        return <TableVisualizationComp
            spec={visualization.visualization.spec}
            visualization={visualization}
        />
    }

    return <div className={"text-[var(--text-light)]"}>
        Esta configuración por ahora no está soportada.
    </div>
};


const PlotData = ({visualization}: { visualization: VisualizationView }) => {
    const dataset = visualization.dataset

    const href = isDatasetView(dataset) ? contentUrl(dataset.uri) : null

    const modal = (onClose: () => void) => <div className={""}>
        {isDatasetView(dataset) && <div
            className={"py-2 space-y-1 rounded-lg px-2 cursor-pointer bg-[var(--background-dark)]" + (href ? " hover:bg-[var(--background-dark2)]" : "")}
            onClick={(e) => {e.stopPropagation(); if(href) window.open(href, "_blank")}}
        >
            <div className={"flex justify-between space-x-1"}>
                <div className={"font-semibold text-[16px] break-all truncate"}>
                    {dataset.name}
                </div>
            </div>
            <div className={"max-w-[400px] text-sm line-clamp-5"}>
                {dataset.description}
            </div>
            <div className={"text-sm text-[var(--text-light)] truncate flex space-x-1"}>
                <div>Publicado por</div>
                <Authorship author={dataset.author} onlyAuthor={true}/>
            </div>
            <div className={"text-[var(--text-light)] text-sm"}>
                Hace <DateSince date={dataset.createdAt}/>
            </div>
        </div>}
        {isTopicsDatasetView(dataset) && <div
            className={"py-2 space-y-1 rounded-lg px-2 text-sm text-[var(--text-light)] cursor-pointer bg-[var(--background-dark)]"}
        >
            <div className={"font-semibold text-[var(--text)]"}>
                Construído en base a propiedades en temas de la wiki.
            </div>
            <div className={""}>
                Filtro usado:
            </div>
            <div className={"pointer-events-none"}>
                <ChooseDatasetPanelFiltersConfig
                    config={visualizationViewToMain(visualization)}
                />
            </div>
        </div>}
    </div>

    return <ClickableModalOnClick id="datos" modal={modal}>
        <div className={"cursor-pointer text-[var(--text-light)] sm:text-lg text-base font-semibold bg-[var(--background-dark2)] hover:bg-[var(--background-dark3)] rounded-xl px-2"}
        >
            Datos
        </div>
    </ClickableModalOnClick>
}


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
        <div
            className={"absolute top-0 right-0 z-10 space-x-2 flex justify-between w-full pt-2 px-2"}
        >
            {!isTable(visualization.visualization.spec) ? <PlotData visualization={visualization}/> : <div/>}
            <div className={"flex space-x-2"}>
                {onEdit && <div
                    onClick={() => {
                        setEditing(true)
                    }}
                    className={"flex items-center space-x-1 text-[var(--text-light)] cursor-pointer sm:text-lg text-base font-semibold bg-[var(--background-dark2)] hover:bg-[var(--background-dark3)] rounded-xl px-2"}
                >
                    <WriteButtonIcon fontSize={"inherit"}/>
                    <div>
                        Editar
                    </div>
                </div>}
                {onDelete && <IconButton
                    size={"small"}
                    color={"background-dark2"}
                    onClick={() => {
                        onDelete()
                    }}
                >
                    <DeleteOutlineIcon fontSize={"inherit"}/>
                </IconButton>}
            </div>
        </div>
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
        visualization,
        dataset,
        $type: "ar.cabildoabierto.embed.visualization#view"
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

    if (isLoading) {
        return <div className={"py-4"}><LoadingSpinner/></div>
    } else if (!data) {
        return null
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
    } else if (isTopicsDataSource(visualization.dataSource)) {
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