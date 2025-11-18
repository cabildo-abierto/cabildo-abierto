import {ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api/dist"
import {BaseFullscreenPopup} from "@/components/utils/dialogs/base-fullscreen-popup";
import dynamic from "next/dynamic";

const VisualizationEditor = dynamic(() => import("@/components/visualizations/editor").then(mod => mod.VisualizationEditor),
    {ssr: false}
)


export const InsertVisualizationModal = ({open, onClose, onSave, initialConfig}: {
    open: boolean
    onClose: () => void;
    onSave: (v: ArCabildoabiertoEmbedVisualization.Main) => void
    initialConfig?: ArCabildoabiertoEmbedVisualization.Main
}) => {

    return <BaseFullscreenPopup
        open={open}
        onClose={onClose}
        closeButton={false}
    >
        <VisualizationEditor
            onClose={onClose}
            onSave={(v: ArCabildoabiertoEmbedVisualization.Main) => {onSave(v); onClose()}}
            initialConfig={initialConfig ? initialConfig : undefined}
        />
    </BaseFullscreenPopup>
}