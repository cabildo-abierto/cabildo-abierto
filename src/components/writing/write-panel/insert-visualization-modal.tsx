import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup";
import {Main as Visualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {VisualizationEditor} from "@/components/visualizations/editor/visualization-editor";


export const InsertVisualizationModal = ({open, onClose, onSave, initialConfig}: {
    open: boolean
    onClose: () => void;
    onSave: (v: Visualization) => void
    initialConfig?: Visualization
}) => {
    return <BaseFullscreenPopup
        open={open}
        onClose={onClose}
        closeButton={false}
        color={"background"}
    >
        <VisualizationEditor
            onClose={onClose}
            onSave={(v: Visualization) => {onSave(v); onClose()}}
            initialConfig={initialConfig ? initialConfig : undefined}
        />
    </BaseFullscreenPopup>
}