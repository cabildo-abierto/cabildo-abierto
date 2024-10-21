"use client"

import MyLexicalEditor, { initializeEmpty, SettingsProps } from "./lexical-editor"
import { useState } from "react"
import StateButton, { StateButtonClickHandler } from "../state-button"
import { EditorState, LexicalEditor } from "lexical"
import { charCount, emptyOutput, hasChanged, validPost } from "../utils"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TitleInput } from "./title-input"
import { useSWRConfig } from "swr"
import { useUser } from "../../app/hooks/user"
import { createPost, publishDraft, updateContent } from "../../actions/contents"
import { compress } from "../compression"
import { useContent } from "../../app/hooks/contents"
import { ExtraChars } from "../extra-chars"

type PostEditorProps = {
    initialData?: string,
    initialTitle?: string
    isFast?: boolean
    isDraft?: boolean
    contentId?: string
    isPublished?: boolean
}


const postEditorSettings: (isFast: boolean, initialData?: string) => SettingsProps = (isFast, initialData) => {
    return {
        disableBeforeInput: false,
        emptyEditor: false,
        isAutocomplete: false,
        isCharLimit: true,
        charLimit: isFast ? 800 : 1200000,
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
        editorClassName: "content",
        isReadOnly: false,
        isAutofocus: true,
        placeholderClassName: "ContentEditable__placeholder"
    }
}


const PostEditor = ({
    initialData=null,
    initialTitle="", 
    isFast=false,
    isDraft=false,
    contentId,
    isPublished=false
}: PostEditorProps) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const router = useRouter()
    const [title, setTitle] = useState(initialTitle)
    const {user} = useUser()
    const {mutate} = useSWRConfig()
    const [errorOnSubmit, setErrorOnSubmit] = useState(false)

    const settings = postEditorSettings(isFast, initialData)

    async function handleSubmit(){
        if(editor && user){
            const text = JSON.stringify(editor.getEditorState())
            const compressedText = compress(text)
            const type = isFast ? "FastPost" : "Post"
            if(!isDraft){ 
                if(!isPublished){
                    const {error} = await createPost(compressedText, type, isDraft, user.id, !isFast ? title : undefined)
                    if(error) return {error}
                } else {
                    const {error} = await updateContent(compressedText, contentId, !isFast ? title : undefined)
                    if(error) return {error}
                }
            } else {
                const {error} = await publishDraft(compressedText, contentId, user.id, !isFast ? title : undefined)
                if(error) return {error}
                mutate("/api/content/"+contentId)
                mutate("/api/drafts/"+user.id)
            }
            mutate("/api/feed")
            mutate("/api/profile-feed/"+user.id)
            router.push("/")
            return {stopResubmit: true}
        }
        return {error: "Ocurrió un error al enviar la publicación."}
	}

    const handleSaveDraft: StateButtonClickHandler = async (e) => {
        if(editor && user){
            const text = JSON.stringify(editor.getEditorState())
            const compressedText = compress(text)
            const type = isFast ? "FastPost" : "Post"
            if(!isDraft){
                if(!isPublished){
                    const {error} = await createPost(compressedText, type, true, user.id, !isFast ? title : undefined)
                    if(error) return {error}
                } else {
                    const {error} = await updateContent(compressedText, contentId, !isFast ? title : undefined)
                    if(error) return {error}
                }
            } else {
                const {error} = await updateContent(compressedText, contentId, title)
                if(error) return {error}
                await mutate("/api/content/" + contentId)
            }
            await mutate("/api/drafts")
            router.push("/borradores")
            return {stopResubmit: true}
        }
        setErrorOnSubmit(true)
        return {error: "Ocurrió un error al guardar el borrador."}
    }

    const count = editor && editorState ? charCount(editorState) : 0
    
    let disabled = !editor || 
        emptyOutput(editorState) ||
        (!isFast && title.length == 0) ||
        (!validPost(editorState, settings.charLimit))

    let saveDraftDisabled = disabled || (isDraft && !hasChanged(editorState, initialData))


	const PublishButton = ({onClick}: {onClick: StateButtonClickHandler}) => {
        return <StateButton
            handleClick={onClick}
            className="small-btn sm:gray-btn text-xs sm:text-sm"
            text1={isPublished ? "Guardar cambios" : "Publicar"}
            text2={isPublished ? "Guardando..." : "Publicando..."}
            textClassName="py-2"
            disabled={disabled}
        />
	}

    const SaveDraftButton = ({onClick}: {onClick: StateButtonClickHandler}) => {
        return <StateButton
            handleClick={onClick}
            className="small-btn sm:gray-btn text-xs sm:text-sm"
            text1="Guardar borrador"
            text2="Guardando..."
            textClassName="py-2"
            disabled={saveDraftDisabled}
        />
	}

    const DraftsButton = () => {
        return <Link href="/borradores">
            <button className="gray-btn hidden text-sm sm:block">
                <div className="py-1">
                Ver borradores
                </div>
            </button>
        </Link>
    }

    return <div className="p-1 rounded">
        <div className="text-sm text-gray-400 text-center">{isFast ? "Publicación rápida" : "Publicación"}</div>
        <div className="flex justify-between mt-3">
            {isPublished ? <div></div> : <DraftsButton/>}
			<div className="flex justify-end space-x-1">
                <PublishButton onClick={handleSubmit}/>
                {!isPublished && <SaveDraftButton onClick={handleSaveDraft}/>}
			</div>
		</div>
        {errorOnSubmit && <div className="text-red-600 sm:text-sm text-xs mt-1 flex justify-end px-1">Ocurrió un error. Intentá de nuevo.</div>}
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
        {settings.charLimit && <ExtraChars charLimit={settings.charLimit} count={count}/>}
    </div>
}


export default PostEditor