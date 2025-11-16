import {useState} from "react";
import {pxToNumber} from "@cabildo-abierto/utils/dist/strings";
import {ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api"
import {TrashIcon} from "@phosphor-icons/react";
import {PlotData} from "./plot-data";
import {BaseButton} from "@/components/utils/base/base-button";
import {WriteButtonIcon} from "@/components/utils/icons/write-button-icon";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {ResponsivePlot, visualizationViewToMain} from "@/components/visualizations/visualization";
import {InsertVisualizationModal} from "@/components/editor";


export default function PlotWithButtons({
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
}