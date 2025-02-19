"use client"

import type {
    LexicalEditor,
  } from 'lexical';
  
import './index.css';

import { commentEditorSettings } from '../../comment-editor';
import { useUser } from '../../../../hooks/user';
import {getStandardSelection} from "./standard-selection";
import {WritePanel} from "../../../write-panel";
import {ReplyToContent} from "./index";


export function CommentInputBox({
    editor,
    parentContent,
    cancelAddComment,
    submitAddComment,
    open
}: {
    cancelAddComment: () => void
    editor: LexicalEditor
    parentContent: ReplyToContent
    submitAddComment: () => void,
    open: boolean
}) {
    const user = useUser()

    const settings = {...commentEditorSettings}
    settings.editorClassName = "min-h-[150px] sm:text-base text-sm"

    if(!user.user) settings.placeholder = "Necesitás una cuenta para agregar un comentario."

    const quote = open ? JSON.stringify(getStandardSelection(editor.getEditorState())) : undefined

    return <WritePanel
        open={open}
        onClose={cancelAddComment}
        replyTo={parentContent}
        quote={quote}
    />
}


