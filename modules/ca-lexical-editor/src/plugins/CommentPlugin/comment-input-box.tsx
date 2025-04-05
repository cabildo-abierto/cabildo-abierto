"use client"

import type {
    LexicalEditor,
  } from 'lexical';
  
import './index.css';
import {getStandardSelection} from "./standard-selection";
import {WritePanel} from "@/components/writing/write-panel";
import {ReplyToContent} from "./index";
import {useSWRConfig} from "swr";


export function CommentInputBox({
    editor,
    parentContent,
    cancelAddComment,
    open
}: {
    cancelAddComment: () => void
    editor: LexicalEditor
    parentContent: ReplyToContent
    open: boolean
}) {
    const {mutate} = useSWRConfig()

    const quote = open ? JSON.stringify(getStandardSelection(editor.getEditorState())) : undefined

    async function onSubmit(){
        if(parentContent.content.topicVersion && parentContent.content.topicVersion.topic){
            const topicId = parentContent.content.topicVersion.topic.id

            await mutate("/api/topic/"+encodeURIComponent(topicId))
            await mutate("/api/topic-feed/"+encodeURIComponent(topicId))
        }
    }

    return <WritePanel
        open={open}
        onClose={cancelAddComment}
        replyTo={parentContent}
        quote={quote}
        onSubmit={onSubmit}
    />
}


