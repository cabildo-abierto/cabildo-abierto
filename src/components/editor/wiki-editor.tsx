"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { EditorState, LexicalEditor } from "lexical"
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
import { useSWRConfig } from "swr"

import dynamic from 'next/dynamic'
import { ToggleButton } from "../toggle-button"
import LoadingSpinner from "../loading-spinner"
import { SettingsProps } from "@/components/editor/lexical-editor"
const MyLexicalEditor = dynamic( () => import( '@/components/editor/lexical-editor' ), { ssr: false } );



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
    const {mutate} = useSWRConfig()
    
    const user = useUser()
    const {content, isLoading, isError} = useContent(contentId)
    if(isLoading || user.isLoading){
        return <LoadingSpinner/>
    }
    if(!content || isError){
        return <></>
    }
    
    const isDevPlayground = false
    const settings: SettingsProps = {
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
        editorClassName: "content mt-4",
        isReadOnly: readOnly,
        content: content,
        isAutofocus: true,
        placeholderClassName: ""
    }

    let hasChanges = false
    
    if(editor && content){
        editorOutput?.read(() => {
            const current = JSON.stringify(editor.getEditorState())
            if(current != content.text){
                hasChanges = true
            }
        })
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
                            await mutate("/api/entities")
                            await mutate("/api/entity/"+entity.id)
                            router.push("/articulo/"+entity.id)
                        }
                    })
                }
            }}
            disabled={!hasChanges}
        />
    }

    return <>
        {!readOnly && <div className="flex justify-end">
            <Link href={"/articulo/"+entity.id} className="mr-2">
                <button className="gray-btn">
                    Volver
                </button>
            </Link>
            <ToggleButton
                className="mr-2 gray-btn flex items-center"
                toggled={editingRoutes}
                setToggled={setEditingRoutes}
                text="Editar categorías"
            />
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