import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup";
import {VisualizationEditor} from "@/components/visualizations/editor/visualization-editor";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"

const InsertVisualizationModal = ({open, onClose, onSave, initialConfig}: {
    open: boolean
    onClose: () => void;
    onSave: (v: ArCabildoabiertoEmbedVisualization.Main) => void
    initialConfig?: ArCabildoabiertoEmbedVisualization.Main
}) => {
    return <BaseFullscreenPopup
        open={open}
        onClose={onClose}
        closeButton={false}
        color={"background"}
        disableScrollLock={false}
    >
        <VisualizationEditor
            onClose={onClose}
            onSave={(v: ArCabildoabiertoEmbedVisualization.Main) => {onSave(v); onClose()}}
            initialConfig={initialConfig ? initialConfig : undefined}
        />
    </BaseFullscreenPopup>
}


export default InsertVisualizationModal