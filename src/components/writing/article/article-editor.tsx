"use client"

import { initializeEmpty, SettingsProps } from "../../../../modules/ca-lexical-editor/src/lexical-editor"
import { useState } from "react"
import { EditorState, LexicalEditor } from "lexical"
import {useRouter} from "next/navigation"
import { TitleInput } from "./title-input"
import dynamic from "next/dynamic"
import {validArticle} from "./valid-article";
import {BackButton} from "../../../../modules/ui-utils/src/back-button";
import {PublishButton} from "@/components/writing/article/publish-button";
const MyLexicalEditor = dynamic( () => import( '../../../../modules/ca-lexical-editor/src/lexical-editor' ), { ssr: false } );


const postEditorSettings: (initialData?: string) => SettingsProps = (initialData) => {
    return {
        disableBeforeInput: false,
        emptyEditor: false,
        isAutocomplete: false,
        isCharLimit: true,
        charLimit: 1200000,
        isCharLimitUtf8: false,
        isCollab: false,
        isMaxLength: false,
        isRichText: true,
        allowImages: true,
        measureTypingPerf: false,
        shouldPreserveNewLinesInMarkdown: true,
        shouldUseLexicalContextMenu: false,
        showNestedEditorTreeView: false,
        showTableOfContents: true,
        showTreeView: false,
        tableCellBackgroundColor: false,
        tableCellMerge: false,
        showActions: false,
        showToolbar: true,
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
        imageClassName: "",
        preventLeave: false
    }
}


const ArticleEditor = () => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const [title, setTitle] = useState("")
    const router = useRouter()

    const settings = postEditorSettings("")
    settings.editorClassName += " px-2"
    settings.placeholderClassName += " px-2"

    const valid = validArticle(editorState, settings.charLimit, title)

    let disabled = valid.problem != undefined

    return <>
        <div className="flex justify-between mt-3 items-center w-full px-3">
			<div className="flex justify-between w-full text-[var(--text-light)]">
                <BackButton onClick={() => {router.back()}}/>
                <PublishButton
                    editor={editor}
                    title={title}
                    disabled={disabled}
                />
			</div>
		</div>
        <div className="mt-3 px-3">
            <TitleInput onChange={setTitle} title={title}/>
        </div>
        <div className={"mt-4"}>
            <MyLexicalEditor
                settings={settings}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />
        </div>
    </>
}


export default ArticleEditor