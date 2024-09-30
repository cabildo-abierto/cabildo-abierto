"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { EditorState, LexicalEditor } from "lexical"
import StateButton from "../state-button"

import { RoutesEditor } from "../routes-editor"
import { useSWRConfig } from "swr"

import dynamic from 'next/dynamic'
import { ToggleButton } from "../toggle-button"
import LoadingSpinner from "../loading-spinner"
import { charDiffFromJSONString, diff, getAllText, nodesFromJSONStr, textNodesFromJSONStr } from "../diff"
import { SerializedDiffNode } from "./nodes/DiffNode"
import { ChangesCounter } from "../changes-counter"
import { SerializedAuthorNode } from "./nodes/AuthorNode"
import { hasChanged } from "./comment-editor"
import { EntityProps } from "../../app/lib/definitions"
import { updateEntity } from "../../actions/entities"
import { useContent } from "../../app/hooks/contents"
import { useUser } from "../../app/hooks/user"
import { SettingsProps } from "./lexical-editor"
import Link from "next/link"
import TickButton from "../tick-button"
import InfoPanel from "../info-panel"
import { hasEditPermission, permissionToPrintable } from "../utils"
const MyLexicalEditor = dynamic( () => import( './lexical-editor' ), { ssr: false } );



type WikiEditorProps = {
    entity: EntityProps,
    version: number,
    readOnly?: boolean,
    showingChanges?: boolean
    showingAuthors?: boolean
    setEditing: (arg0: boolean) => void
}

type MatchesType = {
    matches: {x: number, y: number}[]
    common: {x: number, y: number}[]
    perfectMatches: {x: number, y: number}[]
}

function showChanges(initialData: string, withRespectToContent: string, diff: MatchesType){
    const {common} = diff
    const nodes1 = nodesFromJSONStr(withRespectToContent)
    let parsed2 = null
    try {
        parsed2 = JSON.parse(initialData)
    } catch {
        return initialData // first version where content is ""
    }
    
    const nodes2 = parsed2.root.children

    function newDiffNode(kind: string, childNode){
        const diffNode: SerializedDiffNode = {
            children: [childNode],
            type: "diff",
            kind: kind,
            direction: 'ltr',
            version: 1,
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
            newChildren.push(newDiffNode("removed", nodes1[i]))
            i++
        }
        while(j < y){
            newChildren.push(newDiffNode("new", nodes2[j]))
            j++
        }
        newChildren.push(newDiffNode("no dif", nodes1[x]))
        i++
        j++
    }
    while(i < nodes1.length){
        newChildren.push(newDiffNode("removed", nodes1[i]))
        i++
    }
    while(j < nodes2.length){
        newChildren.push(newDiffNode("new", nodes2[j]))
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
    if(!parsed) {
        return entity.versions[version].text
    }
    let prevNodes = []
    let prevAuthors = []

    for(let i = 0; i <= version; i++){
        const parsedVersion = editorStateFromJSON(entity.versions[i].text)
        if(!parsedVersion) continue
        const nodes = parsedVersion.root.children
        const {matches} = JSON.parse(entity.versions[i].diff)
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


export const PermissionLevel = ({level}: {level: string}) => {
    return <span className="text-[var(--primary)]">
        {permissionToPrintable(level)}
    </span>
}



const NotEnoughPermissionsWarning = ({entity}: {entity: EntityProps}) => {
    const user = useUser()

    const status = user.user.editorStatus
    const info = <div className="w-72">
        <p>Tu nivel de permisos de edición es <PermissionLevel level={status}/> y este artículo requiere nivel <PermissionLevel level={entity.protection}/>.</p>
        <p>Al quedar pendiente de confirmación otros usuarios la pueden ver y comentar, pero no es la versión oficial del artículo hasta que la acepte un editor con suficientes permisos y no va a aparecer por defecto.</p>
    </div>
    return <div className="">
        Tu edición va a quedar pendiente de confirmación. <InfoPanel text={info}/>
    </div>
}



export const SaveEditPopup = ({ 
    editorState, currentVersion, onClose, onSave, entity }: {
        editorState: EditorState,
        currentVersion: string
        onClose: () => void,
        onSave: (v: boolean) => void,
        entity: EntityProps
}) => {
    const [claimsAuthorship, setClaimsAuthorship] = useState(true)
    const {user} = useUser()
    const d = charDiffFromJSONString(currentVersion, JSON.stringify(editorState))
    
    const infoAuthorship = <span className="link">Desactivá este tick si no sos el autor de los cambios que agregaste. Por ejemplo, si estás sumando al artículo el texto de una Ley, o algo escrito por otra persona. Si lo desactivás no vas a obtener ingresos por los caracteres agregados en esta modificación. <Link href="/articulo/Cabildo_Abierto:_Derechos_de_autor">Más información</Link>
    </span>

    return (
        <>
            <div className="fixed inset-0 z-10 flex justify-center items-center">
                
                <div className="bg-[var(--background)] rounded border-2 border-black p-4 z-10 text-center max-w-lg">
                    <h2 className="py-4 text-lg">Confirmar cambios</h2>
                    <div className="mb-8">
                        Estás agregando <span className="text-green-600">{d.charsAdded}</span> caracteres y eliminando <span className="text-red-600">{d.charsDeleted}</span> caracteres.
                    </div>
                    {!hasEditPermission(user, entity.protection) && <div className="mb-8">
                    <NotEnoughPermissionsWarning entity={entity}/>
                    </div>}
                    {true && <div className="flex justify-center">
                        <TickButton
                            ticked={claimsAuthorship}
                            setTicked={setClaimsAuthorship}
                            text={<span className="text-sm text-gray-700">Soy autor/a de los caracteres agregados. <InfoPanel text={infoAuthorship} className="w-72"/></span>}
                        />
                        </div>}
                    <div className="flex justify-center items-center space-x-4 mt-4">
                        <button
                            className="gray-btn w-48"
                            onClick={async () => {onClose()}}
                        >
                            Volver
                        </button>
                        <StateButton
                            className="gray-btn w-48"
                            onClick={async (e) => {await onSave(claimsAuthorship); onClose()}}
                            text1="Confirmar"
                            text2="Guardando..."
                        />
                    </div>
                </div>
            </div>
        </>
    );
};


const WikiEditor = ({entity, version, readOnly=false, showingChanges=false, showingAuthors=false, setEditing}: WikiEditorProps) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editingRoutes, setEditingRoutes] = useState(false)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const {mutate} = useSWRConfig()
    const [settingsChanges, setSettingsChanges] = useState<SettingsProps | undefined>()
    const [settingsAuthors, setSettingsAuthors] = useState<SettingsProps | undefined>()
    const [showingSaveEditPopup, setShowingSaveEditPopup] = useState(false)
    
    const user = useUser()
    
    const contentId = entity.versions[version].id
    const {content, isLoading, isError} = useContent(contentId)
    const changesContent = useContent(showingChanges && version > 0 ? entity.versions[version-1].id : contentId)
    
    useEffect(() => {
        if(!content) return
        if(version > 0){
            let newSettingsChanges = {...settings}
            newSettingsChanges.initialData = showChanges(content.text, changesContent.content.text, JSON.parse(content.diff))
            setSettingsChanges(newSettingsChanges)
        }
    }, [content])
    
    useEffect(() => {
        let newSettingsAuthors = {...settings}
        newSettingsAuthors.initialData = showAuthors(entity, version)
        setSettingsAuthors(newSettingsAuthors)
    }, [entity, version])
    
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
        editorClassName: "content mt-4 text-justify",
        isReadOnly: readOnly,
        content: content,
        isAutofocus: false,
        placeholderClassName: "ContentEditable__placeholder",
    }

    async function saveEdit(claimsAuthorship: boolean){
        if(editor){
            editor.read(async () => {
                if(user.user){
                    setEditing(false)
                    await updateEntity(JSON.stringify(editor.getEditorState()), content.categories, entity.id, user.user.id, claimsAuthorship)
                    mutate("/api/entities")
                    mutate("/api/entity/"+entity.id)
                    mutate("/api/contributions/"+entity.id)
                }
            })
        }
    }

    const SaveEditButton = () => {
        return <StateButton
            className="article-btn"
            text1="Guardar edición"
            text2="Guardando..."
            onClick={() => {setShowingSaveEditPopup(true)}}
            disabled={!editorState || !hasChanged(editorState, content.text)}
        />
    }
    
    const CancelEditButton = () => {
        return <StateButton
            text1="Cancelar edición"
            onClick={() => {setEditing(false)}}
            className="article-btn"
        />
    }

    return <>
        {!readOnly && <div className="flex flex-wrap items-center px-2 space-x-2 border-b">
            <ToggleButton
                className="article-btn"
                toggled={editingRoutes}
                setToggled={setEditingRoutes}
                text="Editar categorías"
            />
            <CancelEditButton/>
            <SaveEditButton/>
        </div>}
        {showingSaveEditPopup && <SaveEditPopup
            editorState={editorState}
            currentVersion={content.text}
            onSave={saveEdit}
            onClose={() => {setShowingSaveEditPopup(false)}}
            entity={entity}
        />}

        {editingRoutes &&
        <div className="py-4">
            <RoutesEditor entity={entity} setEditing={setEditing}/>
        </div>}
        
        <div className="text-center">
        {showingChanges && readOnly && version > 0 && <ChangesCounter
            charsAdded={content.charsAdded} charsDeleted={content.charsDeleted}/>}
        {showingChanges && readOnly && version == 0 && <>Estás viendo la primera versión</>}
        </div>
        <div id="editor">
            {((!showingChanges && !showingAuthors) || version == 0) && <MyLexicalEditor
                settings={settings}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />}
            {(showingChanges && version > 0) && <MyLexicalEditor
                settings={settingsChanges}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />}
            {(showingAuthors && version > 0) && <MyLexicalEditor
                settings={settingsAuthors}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />}
        </div>
    </>
}

export default WikiEditor
