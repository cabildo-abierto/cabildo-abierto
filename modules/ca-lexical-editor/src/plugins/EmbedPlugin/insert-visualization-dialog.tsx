import {LexicalEditor} from "lexical";
import {Main as Visualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {INSERT_EMBED_COMMAND} from "./index";
import dynamic from "next/dynamic";

const InsertVisualizationModal = dynamic(() => import("@/components/writing/write-panel/insert-visualization-modal"));

export function InsertVisualizationDialog({
                                              activeEditor,
                                              onClose,
                                              open
                                          }: {
    activeEditor: LexicalEditor;
    open: boolean;
    onClose: () => void;
}) {
    function onSave(visualization: Visualization) {
        activeEditor.dispatchCommand(INSERT_EMBED_COMMAND, {spec: {$type: "ar.cabildoabierto.embed.visualization", ...visualization}});
        onClose();
    }

    return (
        <InsertVisualizationModal
            open={open}
            onClose={onClose}
            onSave={onSave}
        />
    )
}
