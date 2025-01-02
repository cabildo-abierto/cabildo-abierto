"use client"

import { initializeEmpty, SettingsProps } from "./lexical-editor"
import { useEffect, useRef, useState } from "react"
import StateButton, { StateButtonClickHandler } from "../state-button"
import { EditorState, LexicalEditor } from "lexical"
import {charCount, validPost} from "../utils"
import { useRouter } from "next/navigation"
import { TitleInput } from "./title-input"
import { useSWRConfig } from "swr"
import { useUser } from "../../hooks/user"
import { compress } from "../compression"
import { ExtraChars } from "../extra-chars"
import { Button } from "@mui/material"
import { CustomLink } from "../custom-link"
import dynamic from "next/dynamic"
import useModal from "./hooks/useModal"
import { FastPostImagesEditor } from "../fast-post-images-editor"
import { AddImageButton } from "../add-image-button"
import { createArticle } from "../../actions/contents"
const MyLexicalEditor = dynamic( () => import( './lexical-editor' ), { ssr: false } );
import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
    TRANSFORMERS,
} from '@lexical/markdown';
import {PLAYGROUND_TRANSFORMERS} from "./plugins/MarkdownTransformers";

const postEditorSettings: (isFast: boolean, initialData?: string) => SettingsProps = (isFast, initialData) => {
    return {
        disableBeforeInput: false,
        emptyEditor: false,
        isAutocomplete: false,
        isCharLimit: true,
        charLimit: isFast ? 300 : 1200000,
        isCharLimitUtf8: false,
        isCollab: false,
        isMaxLength: false,
        isRichText: true,
        allowImages: !isFast,
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
        editorClassName: "content sm:ml-0 " + (isFast ? "ml-1" : "ml-3"),
        isReadOnly: false,
        isAutofocus: true,
        placeholderClassName: "ContentEditable__placeholder sm:ml-0 " + (isFast ? "ml-1" : "ml-3"),
        imageClassName: isFast ? "fastpost-image" : "",
        preventLeave: false
    }
}


const DraftsButton = () => {
    return <CustomLink href="/borradores">
        <Button
            variant="text"
            color="primary"
            sx={{textTransform: "none"}}
            disableElevation={true}
        >
            <span className="whitespace-nowrap">Ver borradores</span>
        </Button>
    </CustomLink>
}


type PostEditorProps = {
    isFast?: boolean
    initialData?: string
    initialTitle?: string
    contentId?: string
    isPublished?: boolean
}


function useDebouncedEffect(effect: () => void, deps: any[], delay: number) {
    const handler = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (handler.current) clearTimeout(handler.current);

        handler.current = setTimeout(() => {
            effect();
        }, delay);

        return () => {
            if (handler.current) clearTimeout(handler.current);
        };
    }, [...deps, delay]);
}


const PublishButton = ({editor, lastSaved, isPublished, isFast, title, disabled}: {editor: LexicalEditor, lastSaved: {contentId?: string}, disabled: boolean, isPublished: boolean, isFast: boolean, title?: string}) => {
    const router = useRouter()
    const {mutate} = useSWRConfig()
    const {user} = useUser()

    async function handleSubmit(){
        const text = JSON.stringify(editor.getEditorState().toJSON())
        const compressedText = compress(text)

        const {error} = await createArticle(compressedText, user.did, title)
        if(error) return {error}

        /*await mutate("/api/content/"+lastSaved.contentId)
        await mutate("/api/drafts/"+user.did)
        await mutate("/api/feed")
        await mutate("/api/following-feed")
        await mutate("/api/profile-feed/"+user.did)*/
        router.push("/")
        return {stopResubmit: true}
	}

    return <StateButton
        handleClick={handleSubmit}
        text1={isPublished ? "Guardar cambios" : "Publicar"}
        textClassName="title whitespace-nowrap px-2"
        disabled={disabled}
        size="medium"
        disableElevation={true}
    />
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
    const [saveStatus, setSaveStatus] = useState<"saved" | "error" | "no changes" | "not saved">("no changes")
    const [title, setTitle] = useState(initialTitle)
    const [contentCreationState, setContentCreationState] = useState(contentId ? "created" : "no content")
    const [modal, showModal] = useModal()
    const [images, setImages] = useState([])

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
            /*if(contentCreationState == "creating") return
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
            }*/
        }

        onChange()
    }, [editorState, title, lastSaved], 500)

    async function waitForSaveStatus() {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (saveStatus !== "not saved") {
                    clearInterval(interval);
                    resolve(saveStatus);
                }
            }, 100);
        });
    }

    const handleCreateDraftPost: StateButtonClickHandler = async () => {
        /*const text = JSON.stringify(editor.getEditorState())
        const compressedText = compress(text)
        const type = isFast ? "FastPost" : "Post"

        const {error, result} = await oldCreatePost(compressedText, type, true, user.id, !isFast ? title : undefined)
        if(error) return {error}
        setLastSaved({text: text, title: title, contentId: result.id})
        setContentCreationState("created")

        await mutate("/api/content/" + lastSaved.contentId)
        await mutate("/api/drafts")
        return {stopResubmit: true}*/
        return {}
    }

    const handleSaveDraft = async () => {
        /*if(!lastSaved.contentId){
            return await handleCreateDraftPost()
        }

        const text = JSON.stringify(editor.getEditorState())
        const compressedText = compress(text)
        
        const {error} = await updateContent(compressedText, lastSaved.contentId, user.id, title)
        if(error) {
            setSaveStatus("error")
            return
        }
        setLastSaved({text: text, title: title, contentId: lastSaved.contentId})

        await mutate("/api/content/" + lastSaved.contentId)
        await mutate("/api/drafts")*/
        return {}
    }

    const count = editor && editorState ? charCount(editorState) : 0
    
    const postType = isFast ? "FastPost" : "Post"

    const valid = validPost(editorState, settings.charLimit, postType, images, title)

    let disabled = valid.problem != undefined// || !lastSaved.contentId

    const SaveDraftDialog = () => {
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
        } else if(saveStatus == "error"){
            return <div className="text-gray-400 sm:text-base text-sm">
                Error al guardar. <button onClick={async () => {setSaveStatus("not saved"); await handleSaveDraft()}} className="link2">Reintentar</button>
            </div>
        }
	}

    return <div className="p-1 rounded">
        <div className="text-sm text-gray-400 text-center">{isFast ? "Publicación rápida" : "Publicación"}</div>
        <div className="flex justify-between mt-3 items-center w-full">
            <div className="hidden sm:block w-64">
                {isPublished ? <div></div> : <DraftsButton/>}
            </div>
            <div className="w-full flex sm:justify-center">
                {!isPublished && <SaveDraftDialog/>}
            </div>
			<div className="sm:w-64 w-auto flex space-x-2">
                {isFast && <AddImageButton images={images} setImages={setImages} disabled={false}/>}
                <PublishButton
                    editor={editor}
                    lastSaved={lastSaved}
                    title={title}
                    isFast={isFast}
                    isPublished={isPublished}
                    disabled={disabled}
                />
			</div>
		</div>
        {errorOnSubmit && <div className="text-red-600 sm:text-sm text-xs mt-1 flex justify-end px-1">Ocurrió un error. Intentá de nuevo.</div>}
        {!isFast && <div className="mt-6">
            <TitleInput onChange={setTitle} title={title}/>
        </div>}
        <div className={isFast ? "mt-6" : "mt-4"}>
            <MyLexicalEditor
                settings={settings}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />
        </div>
        {isFast && 
            <div className="flex justify-end mt-4 w-full">
                <FastPostImagesEditor
                    images={images}
                    setImages={setImages}
                />
            </div>
        }
        {modal}
        {settings.charLimit && <ExtraChars charLimit={settings.charLimit} count={count}/>}
    </div>
}


export default PostEditor