import {useState} from "react";
import {pxToNumber} from "@cabildo-abierto/utils";
import {ArCabildoabiertoDataDataset, ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api"
import {TrashIcon} from "@phosphor-icons/react";
import {PlotData} from "./plot-data";
import {BaseButton} from "@/components/utils/base/base-button";
import {WriteButtonIcon} from "@/components/utils/icons/write-button-icon";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {InsertVisualizationModal} from "@/components/editor/insert-visualization-modal";
import { Note } from "@/components/utils/base/note";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {visualizationViewToMain} from "@/components/visualizations/visualization/utils";
import dynamic from "next/dynamic";


const ResponsivePlot = dynamic(() => import("@/components/visualizations/visualization/responsive-plot").then(mod => mod.ResponsivePlot), { ssr: false })

export default function PlotWithButtons({
                                 visualization,
                                 height,
                                 width,
                                 onEdit,
                                 onDelete,
    loadingDataset=false
                             }: {
    visualization: ArCabildoabiertoEmbedVisualization.View
    height?: number | string
    width?: number | string
    onEdit?: (v: ArCabildoabiertoEmbedVisualization.Main) => void
    onDelete?: () => void
    loadingDataset?: boolean
}) {
    const [editing, setEditing] = useState(false)

    const datasetAvailable = (ArCabildoabiertoDataDataset.isDatasetView(visualization.dataset) || ArCabildoabiertoDataDataset.isTopicsDatasetView(visualization.dataset)) && visualization.dataset.data != null

    return <div
        style={{height, width}}
        className={"relative not-article-content"}
    >
        {datasetAvailable && <div
            className={"absolute top-0 left-2 z-[20] h-7"}
        >
            {!ArCabildoabiertoEmbedVisualization.isTable(visualization.visualization.spec) ?
                <PlotData visualization={visualization}/> :
                <div/>}
        </div>}
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
        {datasetAvailable && <ResponsivePlot
            visualization={visualization}
            maxWidth={width ? pxToNumber(width) : undefined}
            maxHeight={height ? pxToNumber(height) : undefined}
        />}
        {!datasetAvailable && !loadingDataset && <Note>
            No se pudo obtener el conjunto de datos.
        </Note>}
        {loadingDataset && <div className={"py-4"}>
            <LoadingSpinner/>
        </div>}
        {editing && <InsertVisualizationModal
            open={editing}
            onClose={() => {
                setEditing(false)
            }}
            onSave={(v) => {
                onEdit(v)
            }}
            initialConfig={visualizationViewToMain(visualization)}
        />}
    </div>
}