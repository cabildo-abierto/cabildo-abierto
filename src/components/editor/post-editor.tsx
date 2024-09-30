"use client"

import MyLexicalEditor, { initializeEmpty, SettingsProps } from "./lexical-editor"
import { useState } from "react"
import StateButton from "../state-button"
import { $getRoot, EditorState, LexicalEditor } from "lexical"
import { emptyOutput, hasChanged, validFastPost } from "./comment-editor"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TitleInput } from "./title-input"
import { InitialEditorStateType } from "@lexical/react/LexicalComposer"
import { useSWRConfig } from "swr"
import { useUser } from "../../app/hooks/user"
import { createPost, publishDraft, updateContent } from "../../actions/contents"

type PostEditorProps = {
    initialData?: string,
    initialTitle?: string
    isFast?: boolean
    isDraft?: boolean
    contentId?: string
}


const PostEditor = ({
    initialData=null,
    initialTitle="", 
    isFast=false,
    isDraft=false,
    contentId
}: PostEditorProps) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const router = useRouter()
    const [title, setTitle] = useState(initialTitle)
    const [submitting, setSubmitting] = useState(false)
    const {user} = useUser()
    const {mutate} = useSWRConfig()

    const settings: SettingsProps = {
        disableBeforeInput: false,
        emptyEditor: false,
        isAutocomplete: false,
        isCharLimit: true,
        charLimit: isFast ? 281 : undefined,
        isCharLimitUtf8: false,
        isCollab: false,
        isMaxLength: false,
        isRichText: true,
        measureTypingPerf: false,
        shouldPreserveNewLinesInMarkdown: true,
        shouldUseLexicalContextMenu: false,
        showNestedEditorTreeView: false,
        showTableOfContents: false,
        showTreeView: false,
        tableCellBackgroundColor: false,
        tableCellMerge: false,
        showActions: false,
        showToolbar: !isFast,
        isComments: false,
        isDraggableBlock: true,
        useSuperscript: false,
        useStrikethrough: false,
        useSubscript: false,
        useCodeblock: false,
        placeholder: "Escribí tu publicación acá...",
        initialData: initialData ? initialData : initializeEmpty(""),
        editorClassName: "content mt-4",
        isReadOnly: false,
        isAutofocus: true,
        placeholderClassName: "ContentEditable__placeholder"
    }

    async function handleSubmit(){
        if(editor && user){
            setSubmitting(true)
            const text = JSON.stringify(editor.getEditorState())
            const type = isFast ? "FastPost" : "Post"
            if(!isDraft){ 
                createPost(text, type, isDraft, user.id, !isFast ? title : undefined)
            } else {
                publishDraft(text, contentId, user.id, !isFast ? title : undefined)
                mutate("/api/content/"+contentId)
                mutate("/api/drafts/"+user.id)
            }
            mutate("/api/feed")
            mutate("/api/profile-feed/"+user.id)
            router.push("/")
            return true
        }
        return false
	}

    async function handleSaveDraft(){
        if(editor && user){
            setSubmitting(true)
            const text = JSON.stringify(editor.getEditorState())
            const type = isFast ? "FastPost" : "Post"
            if(!isDraft){
                await createPost(text, type, true, user.id, !isFast ? title : undefined)
            } else {
                await updateContent(text, contentId, title)
                await mutate("/api/content/" + contentId)
            }
            mutate("/api/drafts")
            router.push("/borradores")
            return true
        }
        return false
    }

    let disabled = !editor || 
        emptyOutput(editorState) ||
        (!isFast && title.length == 0) ||
        (isFast && !validFastPost(editorState, settings.charLimit)) ||
        (isDraft && !hasChanged(editorState, initialData)) || submitting

	const PublishButton = ({onClick}: {onClick: (e) => Promise<boolean>}) => {
        return <StateButton
            onClick={onClick}
            className="gray-btn"
            text1="Publicar"
            text2="Publicando..."
            disabled={disabled}
        />
	}

    const SaveDraftButton = ({onClick}: {onClick: (e) => Promise<boolean>}) => {
        return <StateButton
            onClick={onClick}
            className="gray-btn"
            text1="Guardar borrador"
            text2="Guardando..."
            disabled={disabled}
        />
	}

    const DraftsButton = () => {
        return <Link href="/borradores">
            <button className="gray-btn">
                Ver borradores
            </button>
        </Link>
    }

    return <div className="p-1 rounded">
        
        <div className="flex justify-between mt-3">
            <DraftsButton/>
			<div className="flex justify-end">
                <div className="px-1">
                    <PublishButton onClick={handleSubmit}/>
                </div>
                <SaveDraftButton onClick={handleSaveDraft}/>
			</div>
		</div>
        {!isFast && <div className="mt-6">
            <TitleInput onChange={setTitle} title={title}/>
        </div>}
        <div className={isFast ? "mt-12" : "mt-4"}>
            <MyLexicalEditor
                settings={settings}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />
        </div>
    </div>
}


export default PostEditor