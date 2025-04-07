import {SettingsProps} from "../../../modules/ca-lexical-editor/src/lexical-editor";
import {queryMentions} from "@/server-actions/user/users";


export function getEditorSettings(s: Partial<SettingsProps>): SettingsProps {
    return {
        queryMentions,
        allowImages: true,
        allowTables: true,
        allowPlots: true,
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

        preventLeave: true,
        isReadOnly: true,
        placeholderClassName: "",
        imageClassName: "",
        editorClassName: "",
        tableOfContents: false,
        allowComments: false,

        onAddComment: () => {},

        ...s
    }
}