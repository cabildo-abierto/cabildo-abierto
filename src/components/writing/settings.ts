import {SettingsProps} from "../../../modules/ca-lexical-editor/src/lexical-editor";
import {queryMentions} from "@/components/writing/query-mentions";


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
        shouldPreserveNewLines: false,

        isAutofocus: true,

        showTreeView: false,

        initialText: "",
        initialTextFormat: "plain-text",
        placeholder: "",

        preventLeave: false, // TO DO: Arreglar y pasar a true
        isReadOnly: true,
        imageClassName: "",
        placeholderClassName: "text-[var(--text-light)] absolute top-0 mt-[10px]",
        editorClassName: "min-h-[300px]",
        editorContainerClassName: "relative",
        tableOfContents: false,
        allowComments: false,
        embeds: [],

        topicMentions: true,

        onAddComment: () => {},

        namespace: "Playground",

        ...s
    }
}