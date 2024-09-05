"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { EditorState, LexicalEditor } from "lexical"
import StateButton from "../state-button"

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
import { SerializedDiffNode } from "./nodes/DiffNode"
import { ChangesCounter } from "../changes-counter"
import { SerializedAuthorNode } from "./nodes/AuthorNode"
import { hasChanged } from "./comment-editor"
const MyLexicalEditor = dynamic( () => import( 'src/components/editor/lexical-editor' ), { ssr: false } );



type WikiEditorProps = {
    entity: EntityProps,
    version: number,
    readOnly?: boolean,
    showingChanges?: boolean
    showingAuthors?: boolean
    setEditing: (arg0: boolean) => void
}


function showChanges(initialData: string, withRespectToContent: string){
    const parsed1 = JSON.parse(withRespectToContent)
    const parsed2 = JSON.parse(initialData)
    const {common, matches} = diff(parsed1.root.children, parsed2.root.children)
    
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
    const r = JSON.stringify(parsed2)
    return r
}

export function editorStateFromJSON(text: string){
    let res = null
    try {
        res = JSON.parse(text)
    } catch {

    }
    return res
}

function showAuthors(entity: EntityProps, version: number){
    function newAuthorNode(authors: string[], childNode){
        const authorNode: SerializedAuthorNode = {
            children: [childNode],
            type: "author",
            authors: authors,
            direction: 'ltr',
            version: childNode.version,
            format: 'left',
            indent: 0
        }
        return authorNode
    }

    // el objetivo es asignarle un authorNode a cada nodo de la version dada
    // el autor es el último que lo modificó
    // los nodos "perfectMatches" preservan su autor entre versiones
    // y el resto toman el autor de la versión
    const parsed = editorStateFromJSON(entity.versions[version].text)
    let prevNodes = []
    let prevAuthors = []
    for(let i = 0; i <= version; i++){
        const parsedVersion = editorStateFromJSON(entity.versions[i].text)
        if(!parsedVersion) continue
        const nodes = parsedVersion.root.children
        const {matches} = diff(prevNodes, nodes)
        const versionAuthor = entity.versions[i].authorId
        let nodeAuthors: string[] = []
        for(let j = 0; j < nodes.length; j++){
            let authors = null
            for(let k = 0; k < matches.length; k++){
                if(matches[k] && matches[k].y == j){
                    const prevNodeAuthors = prevAuthors[matches[k].x]
                    if(getAllText(prevNodes[matches[k].x]) == getAllText(nodes[matches[k].y])){
                        authors = prevNodeAuthors
                    } else {
                        if(!prevNodeAuthors.includes(versionAuthor)){
                            authors = [...prevNodeAuthors, versionAuthor]
                        } else {
                            authors = prevNodeAuthors
                        }
                    }
                    break
                }
            }
            if(authors === null) authors = [versionAuthor]
            nodeAuthors.push(authors)
        }
        prevAuthors = [...nodeAuthors]
        prevNodes = [...nodes]
    }
    const newChildren = []
    for(let i = 0; i < prevNodes.length; i++){
        newChildren.push(newAuthorNode(prevAuthors[i], prevNodes[i]))
    }
    parsed.root.children = newChildren
    const r = JSON.stringify(parsed)
    return r
}

const WikiEditor = ({entity, version, readOnly=false, showingChanges=false, showingAuthors=false, setEditing}: WikiEditorProps) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editingRoutes, setEditingRoutes] = useState(false)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
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
    
    const settingsAuthors = {...settings}
    if(showingAuthors)
        settingsAuthors.initialData = showAuthors(entity, version)

    const SaveEditButton = () => {
        return <StateButton
            className="gray-btn"
            text1="Guardar edición"
            text2="Guardando..."
            onClick={async () => {
                if(editor){
                    editor.read(async () => {
                        if(content.categories && user.user){
                            await updateEntity(JSON.stringify(editor.getEditorState()), content.categories, entity.id, user.user.id, true)
                            mutate("/api/entities")
                            mutate("/api/entity/"+entity.id)
                            router.push("/articulo/"+entity.id)
                        }
                    })
                }
            }}
            disabled={!editorState || !hasChanged(editorState, content.text)}
        />
    }
    
    const CancelEditButton = () => {
        return <StateButton
            text1="Cancelar edición"
            onClick={() => {setEditing(false)}}
            className="gray-btn"
        />
    }

    return <>
        {!readOnly && <div className="flex flex-wrap items-center px-2 py-2 space-x-2">
            <ToggleButton
                className="gray-btn"
                toggled={editingRoutes}
                setToggled={setEditingRoutes}
                text="Editar categorías"
            />
            <CancelEditButton/>
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
            {!showingChanges && !showingAuthors && <MyLexicalEditor
                settings={settings}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />}
            {showingChanges && <MyLexicalEditor
                settings={settingsChanges}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />}
            {showingAuthors && <MyLexicalEditor
                settings={settingsAuthors}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />}
        </div>
    </>
}

export default WikiEditor
