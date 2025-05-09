"use client"

import dynamic from "next/dynamic";
import {getEditorSettings} from "@/components/editor/settings";

const MyLexicalEditor = dynamic(() => import('../../../modules/ca-lexical-editor/src/lexical-editor'), {
    ssr: false,
    loading: () => <></>, 
});

const ReadOnlyEditor = ({
    text,
    format,
    allowQuoteComments = false,
    editorClassName="link",
    showTableOfContents = false,
    shouldPreserveNewLines = false
}: {
    text: string
    format: string
    allowQuoteComments?: boolean
    editorClassName?: string
    showTableOfContents?: boolean
    shouldPreserveNewLines?: boolean
}) => {
    const settings = getEditorSettings({
        initialText: text,
        initialTextFormat: format,
        allowComments: allowQuoteComments,
        editorClassName,
        tableOfContents: showTableOfContents,
        shouldPreserveNewLines
    })
    
    return <MyLexicalEditor
        settings={settings}
        setEditor={() => {}}
        setEditorState={() => {}}
    />
}

export default ReadOnlyEditor