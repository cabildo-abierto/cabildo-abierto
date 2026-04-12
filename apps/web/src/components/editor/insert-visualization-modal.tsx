import {ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api/dist"
import {CreateUserEventBody, CreateUserEventOutput} from "@cabildo-abierto/api";
import {BaseFullscreenPopup} from "@/components/utils/dialogs/base-fullscreen-popup";
import dynamic from "next/dynamic";
import {post} from "@/components/utils/react/fetch";

const VisualizationEditor = dynamic(() => import("@/components/visualizations/editor/visualization-editor").then(mod => mod.VisualizationEditor),
    {ssr: false}
)


export const InsertVisualizationModal = ({open, onClose, onSave, initialConfig}: {
    open: boolean
    onClose: () => void;
    onSave: (v: ArCabildoabiertoEmbedVisualization.Main) => void
    initialConfig?: ArCabildoabiertoEmbedVisualization.Main
}) => {
    const saveVisualizationEvent = () => {
        void post<CreateUserEventBody, CreateUserEventOutput>("/event", {
            eventId: "visualization_save"
        }).catch(() => undefined)
    }

    return <BaseFullscreenPopup
        open={open}
        onClose={onClose}
        closeButton={false}
    >
        <VisualizationEditor
            onClose={onClose}
            onSave={(v: ArCabildoabiertoEmbedVisualization.Main) => {
                onSave(v)
                saveVisualizationEvent()
                onClose()
            }}
            initialConfig={initialConfig ? initialConfig : undefined}
        />
    </BaseFullscreenPopup>
}