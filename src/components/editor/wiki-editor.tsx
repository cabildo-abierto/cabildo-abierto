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
import { charDiff, diff, getAllText } from "../diff"
import { SerializedDiffNode } from "./nodes/DiffNode"
const MyLexicalEditor = dynamic( () => import( 'src/components/editor/lexical-editor' ), { ssr: false } );



type WikiEditorProps = {
    entity: EntityProps,
    version: number,
    readOnly?: boolean,
    showingChanges?: boolean
}


const ChangesCounter = ({id1, id2, editor}: {id1: string, id2?: string, editor?: LexicalEditor}) => {
    const content1 = useContent(id1)
    const content2 = useContent(id2 ? id2 : id1)
    if(content1.isLoading || content2.isLoading){
        return <></>
    }

    const parsed1 = JSON.parse(content1.content.text)
    let parsed2 = null
    if(id2){
        parsed2 = JSON.parse(content2.content.text)
    } else {
        parsed2 = JSON.parse(JSON.stringify(editor.getEditorState()))
    }

    let removedChars = 0
    let newChars = 0
    const {common, matches} = diff(parsed1, parsed2)
    for(let i = 0; i < parsed1.root.children.length; i++){
        if(!matches.some(({x, y}) => (i == x))){
            removedChars += getAllText(parsed1.root.children[i]).length
            console.log("unmatched", getAllText(parsed1.root.children[i]))
        }
    }

    for(let i = 0; i < parsed2.root.children.length; i++){
        if(!matches.some(({x, y}) => (i == y))){
            newChars += getAllText(parsed2.root.children[i]).length
            console.log("unmatched", getAllText(parsed2.root.children[i]))
        }
    }

    for(let i = 0; i < matches.length; i++){
        const node1 = getAllText(parsed1.root.children[matches[i].x])
        const node2 = getAllText(parsed2.root.children[matches[i].y])
        const matchDiff = charDiff(node1, node2)
        console.log("from match", node1, node2, matchDiff)
        removedChars += matchDiff.deletions
        newChars += matchDiff.insertions
    }

    return <div className="text-center">
        <span className="text-red-600">-{removedChars}</span> <span className="text-green-600">+{newChars}</span> (caracteres)
    </div>
}

function showChanges(initialData: string, withRespectToContent: string){
    const parsed1 = JSON.parse(withRespectToContent)
    const parsed2 = JSON.parse(initialData)
    const {common, matches} = diff(parsed1, parsed2)
    
    function newDiffNode(kind: string, childNode){
        const diffNode: SerializedDiffNode = {
            children: [childNode],
            type: "diff",
            kind: kind,
            direction: 'ltr',
            version: childNode.version,
            format: 'left',
            indent: 0
        }
        return diffNode
    }

    let i = 0
    let j = 0
    let newChildren = []
    for(let k = 0; k < common.length; k++){
        const {x, y} = common[k]
        while(i < x){
            newChildren.push(newDiffNode("removed", parsed1.root.children[i]))
            i++
        }
        while(j < y){
            newChildren.push(newDiffNode("new", parsed2.root.children[j]))
            j++
        }
        newChildren.push(newDiffNode("no dif", parsed1.root.children[x]))
        i++
        j++
    }
    while(i < parsed1.root.children.length){
        newChildren.push(newDiffNode("removed", parsed1.root.children[i]))
        i++
    }
    while(j < parsed2.root.children.length){
        newChildren.push(newDiffNode("new", parsed2.root.children[j]))
        j++
    }
    parsed2.root.children = newChildren
    console.log("new children", newChildren)
    const r = JSON.stringify(parsed2)
    return r
}

const WikiEditor = ({entity, version, readOnly=false, showingChanges=false}: WikiEditorProps) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editingRoutes, setEditingRoutes] = useState(false)
    const [changed, setChanged] = useState(false)
    const router = useRouter()
    const {mutate} = useSWRConfig()
    
    const user = useUser()
    
    const contentId = entity.versions[version].id
    const {content, isLoading, isError} = useContent(contentId)
    const changesContent = useContent(showingChanges && version > 0 ? entity.versions[version-1].id : contentId)
    if(isLoading || user.isLoading || changesContent.isLoading){
        return <LoadingSpinner/>
    }
    if(!content || isError || !changesContent){
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
        placeholderClassName: "",
    }

    const settingsChanges = {...settings}
    if(showingChanges)
        settingsChanges.initialData = showChanges(content.text, changesContent.content.text)

    const SaveEditButton = () => {
        return <StateButton
            className="gray-btn"
            text1="Guardar edición"
            text2="Guardando..."
            onClick={async () => {
                if(editor){
                    editor.read(async () => {
                        if(content.categories && user.user){
                            await updateEntity(JSON.stringify(editor.getEditorState()), content.categories, entity.id, user.user.id)
                            mutate("/api/entities")
                            mutate("/api/entity/"+entity.id)
                            router.push("/articulo/"+entity.id)
                        }
                    })
                }
            }}
            disabled={!changed}
        />
    }

    return <>
        {!readOnly && <div className="flex">
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
        {showingChanges && readOnly && version > 0 && <ChangesCounter
            id1={entity.versions[version-1].id}
            id2={entity.versions[version].id}/>}
        {showingChanges && readOnly && version == 0 && <div className="text-center">Estás viendo la primera versión</div>}
        {showingChanges && !readOnly && editor && <ChangesCounter
            id1={entity.versions[version].id}
            editor={editor}
        />}
        <div id="editor">
            {!showingChanges && <MyLexicalEditor
                settings={settings}
                setEditor={setEditor}
                setChanged={setChanged}
            />}
            {showingChanges && <MyLexicalEditor
                settings={settingsChanges}
                setEditor={setEditor}
                setChanged={setChanged}
            />}
        </div>
    </>
}

export default WikiEditor
