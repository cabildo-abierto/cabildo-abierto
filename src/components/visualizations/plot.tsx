import {useDataset} from "@/queries/useDataset";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {WriteButtonIcon} from "@/components/layout/icons/write-button-icon";
import {useState} from "react";
import {visualizationViewToMain} from "@/components/writing/write-panel/write-post";
import {IconButton} from "../../../modules/ui-utils/src/icon-button";
import dynamic from "next/dynamic";
import {useTopicsDataset} from "@/components/visualizations/editor/visualization-editor";
import {$Typed} from "@/lex-api/util";
import {pxToNumber} from "@/utils/strings";
import TableVisualizationComp from "@/components/visualizations/table-visualization-comp";
import {ClickableModalOnClick} from "../../../modules/ui-utils/src/popover";
import {Authorship} from "@/components/feed/frame/authorship";
import {DateSince} from "../../../modules/ui-utils/src/date";
import {contentUrl} from "@/utils/uri";
import {ChooseDatasetPanelFiltersConfig} from "@/components/visualizations/editor/choose-dataset";
import {ElectionVisualizationComp} from "@/components/visualizations/editor/election/election-visualization-comp";
import {ArCabildoabiertoEmbedVisualization, ArCabildoabiertoDataDataset} from "@/lex-api"
import { Button } from "../../../modules/ui-utils/src/button";
import {TrashIcon} from "@phosphor-icons/react";

const TwoAxisPlotComp = dynamic(() => import("@/components/visualizations/two-axis-plot-comp"))
const InsertVisualizationModal = dynamic(() => import("@/components/writing/write-panel/insert-visualization-modal"))

export const ResponsivePlot = ({
                                   visualization,
                                   maxWidth,
                                   maxHeight
                               }: {
    visualization: ArCabildoabiertoEmbedVisualization.View
    maxWidth?: number
    maxHeight?: number
}) => {
    if (ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(visualization.visualization.spec) || ArCabildoabiertoEmbedVisualization.isOneAxisPlot(visualization.visualization.spec)) {
        return <TwoAxisPlotComp
            spec={visualization.visualization.spec}
            visualization={visualization}
            maxWidth={maxWidth}
            maxHeight={maxHeight}
        />
    } else if (ArCabildoabiertoEmbedVisualization.isTable(visualization.visualization.spec)) {
        return <TableVisualizationComp
            spec={visualization.visualization.spec}
            visualization={visualization}
        />
    } else if(ArCabildoabiertoEmbedVisualization.isEleccion(visualization.visualization.spec)) {
        return <ElectionVisualizationComp
            spec={visualization.visualization.spec}
            visualization={visualization}
            maxWidth={maxWidth}
            maxHeight={maxHeight}
        />
    }

    return <div className={"text-[var(--text-light)]"}>
        Esta configuración por ahora no está soportada.
    </div>
};


const PlotData = ({visualization}: { visualization: ArCabildoabiertoEmbedVisualization.View }) => {
    const dataset = visualization.dataset

    const href = ArCabildoabiertoDataDataset.isDatasetView(dataset) ? contentUrl(dataset.uri) : null

    const modal = (onClose: () => void) => <div className={""}>
        {ArCabildoabiertoDataDataset.isDatasetView(dataset) && <div
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
        {ArCabildoabiertoEmbedVisualization.isTopicsDataSource(dataset) && <div
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
        <div className={"cursor-pointer border border-[var(--text-lighter)] text-[var(--text-light)] sm:text-base text-sm uppercase font-semibold bg-[var(--background-dark2)] hover:bg-[var(--background-dark3)] px-2"}
        >
            Datos
        </div>
    </ClickableModalOnClick>
}


export default function Plot ({
                         visualization,
                         height,
                         width,
                         onEdit,
                         onDelete
                     }: {
    visualization: ArCabildoabiertoEmbedVisualization.View
    height?: number | string
    width?: number | string
    onEdit?: (v: ArCabildoabiertoEmbedVisualization.Main) => void
    onDelete?: () => void
}) {
    const [editing, setEditing] = useState(false)

    return <div style={{height, width}} className={"relative not-article-content"}>
        <div
            className={"absolute top-2 left-2 z-[20]"}
        >
            {!ArCabildoabiertoEmbedVisualization.isTable(visualization.visualization.spec) ? <PlotData visualization={visualization}/> : <div/>}
        </div>
        {(onEdit || onDelete) && <div className={"absolute top-2 right-2 z-[20] flex space-x-2"}>
            {onEdit && <Button
                onClick={() => {
                    setEditing(true)
                }}
                variant={"contained"}
                color={"background-dark2"}
                size={"small"}
                paddingY={"0px"}
                sx={{borderRadius: "8px"}}
                startIcon={<WriteButtonIcon color="var(--text)" fontSize={12}/>}
            >
                <span className={"text-xs"}>Editar</span>
            </Button>}
            {onDelete && <IconButton
                size={"small"}
                color={"background-dark2"}
                onClick={() => {
                    onDelete()
                }}
                sx={{borderRadius: "8px"}}
            >
                <TrashIcon color="var(--text)" fontSize={16}/>
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


function getDatasetVisualizationView(
    visualization: ArCabildoabiertoEmbedVisualization.Main,
    dataset: $Typed<ArCabildoabiertoDataDataset.DatasetView> | $Typed<ArCabildoabiertoDataDataset.TopicsDatasetView>): ArCabildoabiertoEmbedVisualization.View {
    return {
        visualization,
        dataset,
        $type: "ar.cabildoabierto.embed.visualization#view"
    }
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

    if (isLoading || !dataset) {
        return <div className={"py-4"}><LoadingSpinner/></div>
    }

    const view = getDatasetVisualizationView(visualization, {
        ...dataset,
        $type: "ar.cabildoabierto.data.dataset#datasetView"
    })

    return <Plot visualization={view} width={width} height={height} onEdit={onEdit} onDelete={onDelete}/>
}


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

    return <Plot visualization={view} width={width} height={height} onEdit={onEdit} onDelete={onDelete}/>
}