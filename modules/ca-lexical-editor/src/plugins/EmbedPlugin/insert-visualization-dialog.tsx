import {LexicalEditor} from "lexical";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index";
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
    function onSave(visualization: ArCabildoabiertoEmbedVisualization.Main) {
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
