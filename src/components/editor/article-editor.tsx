"use client"

import { initializeEmpty, SettingsProps } from "./lexical-editor"
import { useEffect, useRef, useState } from "react"
import StateButton from "../ui-utils/state-button"
import { EditorState, LexicalEditor } from "lexical"
import {useRouter} from "next/navigation"
import { TitleInput } from "./title-input"
import { useUser } from "../../hooks/user"
import { compress } from "../utils/compression"
import { ExtraChars } from "../writing/extra-chars"
import useModal from "./hooks/useModal"
import { FastPostImagesEditor } from "../writing/fast-post-images-editor"
import { createArticle } from "../../actions/write/article"
import dynamic from "next/dynamic"
import {validPost} from "../writing/utils";
import {charCount} from "../utils/lexical";
import {BackButton} from "../ui-utils/back-button";
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
        editorClassName: "article-content",
        isReadOnly: false,
        isAutofocus: true,
        placeholderClassName: "ContentEditable__placeholder",
        imageClassName: isFast ? "fastpost-image" : "",
        preventLeave: false
    }
}


type PostEditorProps = {
    isFast?: boolean
    initialData?: string
    initialTitle?: string
    isPublished?: boolean
}


const PublishButton = ({editor, isPublished, title, disabled}: {
    editor: LexicalEditor
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
    isPublished=false
}: PostEditorProps) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const [title, setTitle] = useState(initialTitle)
    const [modal] = useModal()
    const router = useRouter()

    const settings = postEditorSettings(isFast, initialData)
    settings.editorClassName += " px-2"
    settings.placeholderClassName += " px-2"

    const count = editor && editorState ? charCount(editorState) : 0
    
    const postType = isFast ? "FastPost" : "Post"

    const valid = validPost(editorState, settings.charLimit, postType, undefined, title)

    let disabled = valid.problem != undefined

    return <div className="">
        <div className="flex justify-between mt-3 items-center w-full px-3">
			<div className="flex justify-between w-full text-[var(--text-light)]">
                <BackButton onClick={() => {router.back()}}/>
                <PublishButton
                    editor={editor}
                    title={title}
                    isFast={isFast}
                    isPublished={isPublished}
                    disabled={disabled}
                />
			</div>
		</div>
        {!isFast && <div className="mt-3 px-3">
            <TitleInput onChange={setTitle} title={title}/>
        </div>}
        <div className={isFast ? "mt-6" : "mt-4"}>
            <MyLexicalEditor
                settings={settings}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />
        </div>
        {modal}
        {settings.charLimit && <ExtraChars charLimit={settings.charLimit} count={count}/>}
    </div>
}


export default PostEditor