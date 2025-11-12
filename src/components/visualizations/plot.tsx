import {useDataset} from "@/queries/getters/useDataset";
import LoadingSpinner from "../layout/base/loading-spinner";
import {WriteButtonIcon} from "@/components/layout/icons/write-button-icon";
import {useState} from "react";
import {visualizationViewToMain} from "@/components/writing/write-panel/write-post";
import {BaseIconButton} from "../layout/base/base-icon-button";
import dynamic from "next/dynamic";
import {useTopicsDataset} from "@/components/visualizations/editor/visualization-editor";
import {$Typed} from "@/lex-api/util";
import {pxToNumber} from "@/utils/strings";
import {ModalOnClick} from "../layout/utils/modal-on-click";
import {Authorship} from "@/components/feed/frame/authorship";
import {DateSince} from "../layout/utils/date";
import {contentUrl} from "@/utils/uri";
import {ChooseDatasetPanelFiltersConfig} from "@/components/visualizations/editor/choose-dataset";
import {ArCabildoabiertoEmbedVisualization, ArCabildoabiertoDataDataset} from "@/lex-api"
import {BaseButton} from "../layout/base/baseButton";
import {TableIcon, TrashIcon} from "@phosphor-icons/react";
import {DatasetDescription} from "@/components/visualizations/datasets/dataset-description";
import {BaseNotButton} from "@/components/layout/base/base-not-button";
import {cn} from "@/lib/utils";

const TwoAxisPlotComp = dynamic(() => import("@/components/visualizations/two-axis-plot-comp"))
const InsertVisualizationModal = dynamic(() => import("@/components/writing/write-panel/insert-visualization-modal"))
const TableVisualizationComp = dynamic(() => import("@/components/visualizations/table-visualization-comp"))
const ElectionVisualizationComp = dynamic(() => import("@/components/visualizations/editor/election/election-visualization-comp"))

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
            maxWidth={maxWidth}
            maxHeight={maxHeight}
        />
    } else if (ArCabildoabiertoEmbedVisualization.isEleccion(visualization.visualization.spec)) {
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
}


const PlotData = ({visualization}: { visualization: ArCabildoabiertoEmbedVisualization.View }) => {
    const dataset = visualization.dataset

    const href = ArCabildoabiertoDataDataset.isDatasetView(dataset) ? contentUrl(dataset.uri, dataset.author.handle) : null

    const modal = (onClose: () => void) => <div className={""}>
        {ArCabildoabiertoDataDataset.isDatasetView(dataset) && <div
            className={cn("py-2 space-y-1 px-2 cursor-pointer", href && "hover:bg-[var(--background-dark2)]")}
            onClick={(e) => {
                e.stopPropagation();
                if (href) window.open(href, "_blank")
            }}
        >
            <div className={"flex justify-between space-x-1"}>
                <div className={"font-semibold text-[16px] break-all truncate"}>
                    {dataset.name}
                </div>
            </div>
            <div className={"max-w-[400px] text-sm line-clamp-5"}>
                <DatasetDescription description={dataset.description}/>
            </div>
            <div className={"text-sm text-[var(--text-light)] truncate flex space-x-1"}>
                <div>Publicado por</div>
                <Authorship author={dataset.author} onlyAuthor={true}/>
            </div>
            <div className={"text-[var(--text-light)] text-sm"}>
                Últ. actualización hace <DateSince date={dataset.editedAt ?? dataset.createdAt}/>
            </div>
        </div>}
        {ArCabildoabiertoDataDataset.isTopicsDatasetView(dataset) && <div
            className={"py-2 space-y-1 px-2 text-sm text-[var(--text-light)] cursor-pointer"}
        >
            <div className={"font-semibold text-[var(--text)]"}>
                Construído en base a propiedades en temas de la wiki.
            </div>
            <div>
                Filtro usado:
            </div>
            <div className={"pointer-events-none"}>
                <ChooseDatasetPanelFiltersConfig
                    config={visualizationViewToMain(visualization)}
                />
            </div>
        </div>}
    </div>

    return <ModalOnClick modal={modal} className={"z-[1501]"}>
        <BaseNotButton
            className={"mt-1"}
            variant={"outlined"}
            size={"small"}
            startIcon={<TableIcon/>}
        >
            Datos
        </BaseNotButton>
    </ModalOnClick>
}


export default function Plot({
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

    return <div
        style={{height, width}}
        className={"relative not-article-content"}
    >
        <div
            className={"absolute top-0 left-2 z-[20] h-7"}
        >
            {!ArCabildoabiertoEmbedVisualization.isTable(visualization.visualization.spec) ?
                <PlotData visualization={visualization}/> : <div/>}
        </div>
        {(onEdit || onDelete) && <div className={"absolute h-7 top-2 right-2 z-[20] flex space-x-2"}>
            {onEdit && <BaseButton
                onClick={() => {
                    setEditing(true)
                }}
                variant={"outlined"}
                size={"small"}
                startIcon={<WriteButtonIcon/>}
            >
                Editar
            </BaseButton>}
            {onDelete && <BaseIconButton
                size={"small"}
                variant={"outlined"}
                onClick={() => {
                    onDelete()
                }}
            >
                <TrashIcon/>
            </BaseIconButton>}
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

    return <Plot
        visualization={view}
        width={width}
        height={height}
        onEdit={onEdit}
        onDelete={onDelete}
    />
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