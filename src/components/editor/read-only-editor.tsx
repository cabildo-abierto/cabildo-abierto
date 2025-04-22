"use client"

import { SettingsProps } from "../../../modules/ca-lexical-editor/src/lexical-editor"

import dynamic from "next/dynamic";
import {FastPostProps} from "@/lib/types";
import {getEditorSettings} from "@/components/editor/settings";
import {ReplyToContent} from "@/components/writing/write-panel/write-panel";

const MyLexicalEditor = dynamic(() => import('../../../modules/ca-lexical-editor/src/lexical-editor'), {
    ssr: false,
    loading: () => <></>, 
});

const ReadOnlyEditor = ({
    text,
    format,
    allowQuoteComments = false,
    editorClassName="link",
    showTableOfContents = false
}: {
    text: string
    format: string
    allowQuoteComments?: boolean
    editorClassName?: string
    showTableOfContents?: boolean
}) => {
    const settings = getEditorSettings({
        initialText: text,
        initialTextFormat: format,
        allowComments: allowQuoteComments,
        editorClassName,
        tableOfContents: showTableOfContents
    })
    
    return <MyLexicalEditor
        settings={settings}
        setEditor={() => {}}
        setEditorState={() => {}}
    />
}

export default ReadOnlyEditor