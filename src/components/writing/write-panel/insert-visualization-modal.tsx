import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup";
import {View as VisualizationView} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {VisualizationEditor} from "@/components/visualizations/editor/visualization-editor";


export const InsertVisualizationModal = ({open, onClose, onSave}: {
    open: boolean
    onClose: () => void;
    onSave: (v: VisualizationView) => void
}) => {
    return <BaseFullscreenPopup
        open={open}
        onClose={onClose}
        closeButton={false}
        color={"background"}
    >
        <VisualizationEditor
            onClose={onClose}
            onSave={(v: VisualizationView) => {onSave(v); onClose()}}
        />
    </BaseFullscreenPopup>
}