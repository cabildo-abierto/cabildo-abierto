"use client"

import {getEditorSettings} from "@/components/editor/settings";
import LightEditor from "../../../modules/ca-lexical-editor/src/light-editor";

const ReadOnlyEditor = ({
    text,
    format,
    editorClassName="link",
    shouldPreserveNewLines = false,
    namespace="namespace",
    topicMentions=true
}: {
    text: string
    format: string
    allowQuoteComments?: boolean
    editorClassName?: string
    shouldPreserveNewLines?: boolean
    namespace?: string
    topicMentions?: boolean
}) => {
    const settings = getEditorSettings({
        initialText: text,
        initialTextFormat: format,
        editorClassName,
        shouldPreserveNewLines,
        namespace,
        topicMentions
    })
    
    return <LightEditor
        settings={settings}
        setEditor={() => {}}
        setEditorState={() => {}}
    />
}

export default ReadOnlyEditor