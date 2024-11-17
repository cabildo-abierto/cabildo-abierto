"use client"

import MyLexicalEditor, { initializeEmpty, SettingsProps } from "./lexical-editor"
import { useEffect, useRef, useState } from "react"
import StateButton, { StateButtonClickHandler } from "../state-button"
import { EditorState, LexicalEditor } from "lexical"
import { charCount, emptyOutput, hasChanged, validPost } from "../utils"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TitleInput } from "./title-input"
import { useSWRConfig } from "swr"
import { useUser } from "../../app/hooks/user"
import { createPost, publishDraft, updateContent } from "../../actions/contents"
import { compress, decompress } from "../compression"
import { useContent } from "../../app/hooks/contents"
import { ExtraChars } from "../extra-chars"
import { Button } from "@mui/material"
import { ContentProps } from "../../app/lib/definitions"


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
        editorClassName: "content sm:ml-0 ml-3",
        isReadOnly: false,
        isAutofocus: true,
        placeholderClassName: "ContentEditable__placeholder sm:ml-0 ml-3",
        imageClassName: isFast ? "fastpost-image" : ""
    }
}


const DraftsButton = () => {
    return <Link href="/borradores">
        <Button
            variant="outlined"
            color="primary"
            sx={{textTransform: "none"}}
            disableElevation={true}
        >
            <span className="whitespace-nowrap">Ver borradores</span>
        </Button>
    </Link>
}


type PostEditorProps = {
    isFast?: boolean
    initialData?: string
    initialTitle?: string
    contentId?: string
    isPublished?: boolean
}


function useDebouncedEffect(effect, deps, delay) {
    const handler = useRef();

    useEffect(() => {
        if (handler.current) clearTimeout(handler.current);

        handler.current = setTimeout(() => {
            effect();
        }, delay);

        return () => {
            clearTimeout(handler.current);
        };
    }, [...deps]);
}


const PostEditor = ({
    isFast=false,
    initialData,
    initialTitle="",
    contentId,
    isPublished=false
}: PostEditorProps) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const router = useRouter()
    const {user} = useUser()
    const {mutate} = useSWRConfig()
    const [errorOnSubmit, setErrorOnSubmit] = useState(false)
    const [saveStatus, setSaveStatus] = useState("no changes")
    const [title, setTitle] = useState(initialTitle)
    const [contentCreationState, setContentCreationState] = useState(contentId ? "created" : "no content")

    const [lastSaved, setLastSaved] = useState({
        text: initialData,
        title: initialTitle,
        contentId: contentId
    })

    const settings = postEditorSettings(isFast, initialData)

    useDebouncedEffect(() => {
        if(!editorState) return
        if(isPublished) return

        async function onChange(){
            if(contentCreationState == "creating") return
            if(hasChanged(editorState, lastSaved.text) || title != lastSaved.title){
                // distinto del last saved
                setSaveStatus("not saved")
                if(!lastSaved.contentId){
                    setContentCreationState("creating")
                    await handleCreateDraftPost()
                } else {
                    await handleSaveDraft()
                }
            } else if(hasChanged(editorState, initialData) || title != initialTitle){
                // igual al last saved y distinto del inicial
                setSaveStatus("saved")
            } else {
                // igual al last saved e igual al inicial
                setSaveStatus("no changes")
            }
        }

        onChange()
    }, [editorState, title, lastSaved], 500)

    async function handleSubmit(){
        if(lastSaved.contentId){
            const text = JSON.stringify(editor.getEditorState())
            const compressedText = compress(text)
    
            const {error} = await publishDraft(compressedText, lastSaved.contentId, user.id, isPublished, !isFast ? title : undefined)
            if(error) return {error}
    
            mutate("/api/content/"+lastSaved.contentId)
            mutate("/api/drafts/"+user.id)
            mutate("/api/feed")
            mutate("/api/profile-feed/"+user.id)
            router.push("/")
            return {stopResubmit: true}
        }
	}

    const handleCreateDraftPost: StateButtonClickHandler = async () => {
        const text = JSON.stringify(editor.getEditorState())
        const compressedText = compress(text)
        const type = isFast ? "FastPost" : "Post"

        console.log("crating draft post")
        const {error, id: contentId} = await createPost(compressedText, type, true, user.id, !isFast ? title : undefined)
        if(error) return {error}
        console.log("setting last saved", {text: text, title: title, contentId})
        setLastSaved({text: text, title: title, contentId})
        setContentCreationState("created")

        await mutate("/api/content/" + lastSaved.contentId)
        await mutate("/api/drafts")
        return {stopResubmit: true}
    }

    const handleSaveDraft: StateButtonClickHandler = async () => {
        const text = JSON.stringify(editor.getEditorState())
        const compressedText = compress(text)
        
        console.log("updating content", text, title, isFast)
        const {error} = await updateContent(compressedText, lastSaved.contentId, user.id, title)
        if(error) return {error}
        setLastSaved({text: text, title: title, contentId: lastSaved.contentId})

        await mutate("/api/content/" + lastSaved.contentId)
        await mutate("/api/drafts")
        return {stopResubmit: true}
    }

    const count = editor && editorState ? charCount(editorState) : 0
    
    const postType = isFast ? "FastPost" : "Post"

    const valid = validPost(editorState, settings.charLimit, postType)

    let disabled = !editor || !editorState ||
        emptyOutput(editorState) ||
        (!isFast && title.length == 0) ||
        (valid.problem != undefined)

	const PublishButton = ({onClick}: {onClick: StateButtonClickHandler}) => {
        return <StateButton
            handleClick={onClick}
            text1={isPublished ? "Guardar cambios" : "Publicar"}
            text2={isPublished ? "Guardando..." : "Publicando..."}
            textClassName="title whitespace-nowrap px-2"
            disabled={disabled}
            size="medium"
            disableElevation={true}
        />
	}

    const SaveDraftButton = ({onClick}: {onClick: StateButtonClickHandler}) => {
        if(saveStatus == "no changes"){
            return <></>
        } else if(saveStatus == "not saved"){
            return <div className="text-gray-400 sm:text-base text-sm">
                Guardando borrador...
            </div>
        } else if(saveStatus == "saved"){
            return <div className="text-gray-400 sm:text-base text-sm">
                Cambios guardados
            </div>
        }
	}

    return <div className="p-1 rounded">
        <div className="text-sm text-gray-400 text-center">{isFast ? "Publicación rápida" : "Publicación"}</div>
        <div className="flex justify-between mt-3 items-center w-full">
            <div className="w-48">
            {isPublished ? <div></div> : <DraftsButton/>}
            </div>
            <div className="w-full flex justify-center">
            {!isPublished && <SaveDraftButton onClick={handleSaveDraft}/>}
            </div>
			<div className="w-48">
                <PublishButton onClick={handleSubmit}/>
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