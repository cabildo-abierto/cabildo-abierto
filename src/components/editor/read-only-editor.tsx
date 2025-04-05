"use client"

import { SettingsProps } from "../../../modules/ca-lexical-editor/src/lexical-editor"

import dynamic from "next/dynamic";
import {FastPostProps} from "@/lib/definitions";
import {ReplyToContent} from "../../../modules/ca-lexical-editor/src/plugins/CommentPlugin";
import {queryMentions} from "@/server-actions/user/users";
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
    content,
    quoteReplies,
    pinnedReplies,
    setPinnedReplies,
    showTableOfContents = false
}: {
    text: string
    format: string
    allowQuoteComments?: boolean
    editorClassName?: string
    content?: ReplyToContent
    quoteReplies?: FastPostProps[]
    pinnedReplies?: string[]
    setPinnedReplies?: (v: string[]) => void
    showTableOfContents?: boolean
}) => {
    const settings = getEditorSettings({
        initialText: text,
        initialTextFormat: format,
        allowComments: allowQuoteComments,
        editorClassName,
        content,
        quoteReplies,
        pinnedReplies,
        setPinnedReplies,
        tableOfContents: showTableOfContents
    })
    
    return <MyLexicalEditor
        settings={settings}
        setEditor={() => {}}
        setEditorState={() => {}}
    />
}

export default ReadOnlyEditor