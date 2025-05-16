import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup";
import {useState} from "react";
import {Main as Visualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {CloseButton} from "../../../../modules/ui-utils/src/close-button";
import {VisualizationEditor} from "@/components/visualizations/editor/editor";


export const InsertVisualizationModal = ({open, onClose, onSubmit}: {
    open: boolean
    onClose: () => void;
    onSubmit: (v: Visualization) => void
}) => {
    const [visualization, setVisualization] = useState<Visualization>();

    return <BaseFullscreenPopup
        open={open}
        onClose={onClose}
        closeButton={false}
        color={"background"}
    >
        <VisualizationEditor onClose={onClose}/>

    </BaseFullscreenPopup>
}