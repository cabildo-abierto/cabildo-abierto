"use client"

import { initializeEmpty, SettingsProps } from "./lexical-editor"
import { useEffect, useRef, useState } from "react"
import StateButton, { StateButtonClickHandler } from "../ui-utils/state-button"
import { EditorState, LexicalEditor } from "lexical"
import {charCount, validPost} from "../utils/utils"
import {usePathname, useRouter} from "next/navigation"
import { TitleInput } from "./title-input"
import { useSWRConfig } from "swr"
import { useUser } from "../../hooks/user"
import { compress } from "../utils/compression"
import { ExtraChars } from "../writing/extra-chars"
import { Button } from "@mui/material"
import { CustomLink } from "../ui-utils/custom-link"
import useModal from "./hooks/useModal"
import { FastPostImagesEditor } from "../writing/fast-post-images-editor"
import { AddImageButton } from "../writing/add-image-button"
import { createArticle } from "../../actions/write/article"
import dynamic from "next/dynamic"
const MyLexicalEditor = dynamic( () => import( './lexical-editor' ), { ssr: false } );

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
        showTableOfContents: true,
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
        editorClassName: "article-content sm:ml-0 " + (isFast ? "ml-1" : "ml-3"),
        isReadOnly: false,
        isAutofocus: true,
        placeholderClassName: "ContentEditable__placeholder sm:ml-0 " + (isFast ? "ml-1" : "ml-3"),
        imageClassName: isFast ? "fastpost-image" : "",
        preventLeave: false
    }
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


const PublishButton = ({editor, isPublished, title, disabled}: {
    editor: LexicalEditor
    lastSaved: {contentId?: string}
    disabled: boolean
    isPublished: boolean
    isFast: boolean
    title?: string
}) => {
    const router = useRouter()
    const {user} = useUser()

    async function handleSubmit(){
        const text = JSON.stringify(editor.getEditorState().toJSON())
        const compressedText = compress(text)

        const {error} = await createArticle(compressedText, user.did, title)
        if(error) return {error}

        router.push("/")
        return {stopResubmit: true}
	}

    return <StateButton
        handleClick={handleSubmit}
        text1={isPublished ? "Guardar cambios" : "Publicar"}
        textClassName="whitespace-nowrap px-2 font-semibold"
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
    const [saveStatus, setSaveStatus] = useState<"saved" | "error" | "no changes" | "not saved">("no changes")
    const [title, setTitle] = useState(initialTitle)
    const [modal, showModal] = useModal()
    const [images, setImages] = useState([])

    const [lastSaved, setLastSaved] = useState({
        text: initialData,
        title: initialTitle,
        contentId: contentId
    })

    const settings = postEditorSettings(isFast, initialData)

    const count = editor && editorState ? charCount(editorState) : 0
    
    const postType = isFast ? "FastPost" : "Post"

    const valid = validPost(editorState, settings.charLimit, postType, images, title)

    let disabled = valid.problem != undefined

    return <div className="px-3">
        <div className="flex justify-between mt-3 items-center w-full">
			<div className="flex">
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