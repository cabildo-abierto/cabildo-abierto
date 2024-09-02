"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { EditorState, LexicalEditor } from "lexical"
import StateButton from "../state-button"

import Link from "next/link"
import { RoutesEditor } from "../routes-editor"
import { useContent } from "src/app/hooks/contents"
import { updateEntity } from "src/actions/actions"
import { useUser } from "src/app/hooks/user"
import { EntityProps } from "src/app/lib/definitions"
import { useSWRConfig } from "swr"

import dynamic from 'next/dynamic'
import { ToggleButton } from "../toggle-button"
import LoadingSpinner from "../loading-spinner"
import { SettingsProps } from "src/components/editor/lexical-editor"
import { diff, getAllText } from "../diff"
const MyLexicalEditor = dynamic( () => import( 'src/components/editor/lexical-editor' ), { ssr: false } );



type WikiEditorProps = {
    entity: EntityProps,
    version: number,
    readOnly?: boolean,
    showingChanges?: boolean
}


const ChangesCounter = ({entity, version1, version2}: {entity: EntityProps, version1: number, version2: number}) => {
    const content1 = useContent(entity.versions[Math.max(version1, 0)].id)
    const content2 = useContent(entity.versions[version2].id)
    if(content1.isLoading || content2.isLoading){
        return <></>
    }
    if(version1 < 0){
        return <div className="text-center">Estás viendo la primera versión del artículo.</div>
    }

    const parsed1 = JSON.parse(content1.content.text)
    const parsed2 = JSON.parse(content2.content.text)

    const {newNodes, removedNodes, matches} = diff(parsed1, parsed2)

    let removedChars = 0
    for(let i = 0; i < removedNodes.length; i++){
        removedChars += getAllText(parsed1.root.children[i]).length
    }

    let newChars = 0
    for(let i = 0; i < newNodes.length; i++){
        newChars += getAllText(parsed2.root.children[i]).length
    }

    return <div className="text-center">
        <span className="text-red-600">-{removedChars}</span> <span className="text-green-600">+{newChars}</span> (caracteres)
    </div>
}

const WikiEditor = ({entity, version, readOnly=false, showingChanges=false}: WikiEditorProps) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorOutput, setEditorOutput] = useState<EditorState | undefined>(undefined)
    const [editingRoutes, setEditingRoutes] = useState(false)
    const router = useRouter()
    const {mutate} = useSWRConfig()
    
    const user = useUser()
    
    const contentId = entity.versions[version].id
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
                            await updateEntity(JSON.stringify(editor.getEditorState()), content.categories, entity.id, user.user.id)
                            mutate("/api/entities")
                            mutate("/api/entity/"+entity.id)
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

        {showingChanges && <ChangesCounter entity={entity} version1={version-1} version2={version}/>}
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