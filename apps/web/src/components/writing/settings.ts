import {SettingsProps} from "@/components/editor";
import {queryMentions} from "./query-mentions";
import {queryTopics} from "@/components/writing/query-topics";


export function getEditorSettings(s: Partial<SettingsProps>): SettingsProps {
    return {
        queryMentions,
        queryTopics: queryTopics,
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