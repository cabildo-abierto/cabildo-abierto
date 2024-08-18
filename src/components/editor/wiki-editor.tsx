"use client"
import { useState } from "react"
import MyLexicalEditor from "./lexical-editor"
import { useRouter } from "next/navigation"
import { $getRoot, EditorState, LexicalEditor } from "lexical"
import StateButton from "../state-button"
import { updateContent } from "@/actions/create-content"

import Link from "next/link"
import { RoutesEditor } from "../routes-editor"
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { useContent } from "@/app/hooks/contents"
import { updateEntity } from "@/actions/create-entity"
import { useUser } from "@/app/hooks/user"
import { EntityProps } from "@/app/lib/definitions"

type WikiEditorProps = {
    contentId: string,
    entity: EntityProps,
    readOnly?: boolean
}

const WikiEditor = ({contentId, entity, readOnly=false}: WikiEditorProps) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorOutput, setEditorOutput] = useState<EditorState | undefined>(undefined)
    const [editingRoutes, setEditingRoutes] = useState(false)
    const router = useRouter()
    
    const user = useUser()
    const {content, isLoading, isError} = useContent(contentId)
    if(isLoading || user.isLoading){
        return <></>
    }
    if(!content || isError){
        return <>Ocurrió un error :(</>
    }
    
    const isDevPlayground = false
    const settings = {
        disableBeforeInput: false,
        emptyEditor: isDevPlayground,
        isAutocomplete: false,
        isCharLimit: false,
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
        showToolbar: !readOnly,
        isComments: readOnly,
        isDraggableBlock: !readOnly,
        useSuperscript: false,
        useStrikethrough: false,
        useSubscript: false,
        useCodeblock: false,
        placeholder: "Este artículo está vacío!",
        initialData: content.text,
        isMarkdownEditor: false,
        editorClassName: "content mt-4",
        isReadOnly: readOnly,
        user: user.user,
        content: content,
        isAutofocus: true
    }

    const SaveEditButton = () => {
        return <StateButton
            className="gray-btn"
            text1="Guardar edición"
            text2="Guardando..."
            onClick={async () => {
                if(editor && editorOutput){
                    editorOutput.read(async () => {
                        if(content.categories && user.user){
                            await updateEntity(JSON.stringify(editor.getEditorState()), content.categories, entity.id, user.user)
                            router.push("/articulo/"+entity.id)
                        }
                    })
                }
            }}
        />
    }

    return <>
        {!readOnly && <div className="flex justify-end">
            <Link href={"/articulo/"+entity.id} className="mr-2">
                <button className="gray-btn">
                    Volver
                </button>
            </Link>
            <button
                className="mr-2 gray-btn flex items-center"
                onClick={() => {setEditingRoutes(!editingRoutes)}}
            >
                <span>Editar categorías</span>{editingRoutes ? <ArrowDropUpIcon/> : <ArrowDropDownIcon/>}
            </button>
            <SaveEditButton/>
        </div>}

        {editingRoutes &&
        <div className="py-4">
            <RoutesEditor entity={entity}/>
        </div>}

        <div id="editor">
            <MyLexicalEditor
                settings={settings}
                setEditor={setEditor}
                setOutput={setEditorOutput}
            />
        </div>
    </>
}


export default WikiEditor