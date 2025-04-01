"use client"

import type {
    LexicalEditor,
  } from 'lexical';
  
import './index.css';

import { commentEditorSettings } from '@/components/editor/comment-editor-settings';
import {getStandardSelection} from "./standard-selection";
import {WritePanel} from "../../../../../src/components/writing/write-panel";
import {ReplyToContent} from "./index";
import {useSWRConfig} from "swr";
import {useUser} from "../../../../../src/hooks/swr";


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
    const user = useUser()
    const {mutate} = useSWRConfig()

    const settings = {...commentEditorSettings}
    settings.editorClassName = "min-h-[150px] sm:text-base text-sm"

    if(!user.user) settings.placeholder = "Necesitás una cuenta para agregar un comentario."

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


