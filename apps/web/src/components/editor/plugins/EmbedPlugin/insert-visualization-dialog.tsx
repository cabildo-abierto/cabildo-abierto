import {LexicalEditor} from "lexical";
import {ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api";
import {INSERT_EMBED_COMMAND} from "./index";
import {InsertVisualizationModal} from "@/components/editor";

export default function InsertVisualizationDialog({
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
