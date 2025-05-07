import {SettingsProps} from "../../../modules/ca-lexical-editor/src/lexical-editor";
import {queryMentions} from "@/components/editor/query-mentions";


export function getEditorSettings(s: Partial<SettingsProps>): SettingsProps {
    return {
        queryMentions,
        allowImages: true,
        allowTables: true,
        allowVisualizations: true,
        markdownShortcuts: true,
        isRichText: true,
        showToolbar: false,
        useSuperscript: false,
        useStrikethrough: false,
        useSubscript: false,
        useContextMenu: false,
        isDraggableBlock: false,

        isAutofocus: true,

        measureTypingPerf: false,
        showTreeView: false,

        initialText: "",
        initialTextFormat: "plain-text",
        placeholder: "",

        preventLeave: false, // TO DO: Arreglar y pasar a true
        isReadOnly: true,
        imageClassName: "",
        placeholderClassName: "text-[var(--text-light)] absolute top-0 mt-[10px]",
        editorClassName: "relative min-h-[300px]",
        tableOfContents: false,
        allowComments: false,

        onAddComment: () => {},

        ...s
    }
}