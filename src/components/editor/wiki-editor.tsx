"use client"
import { useEffect, useState } from "react"
import { EditorState, LexicalEditor } from "lexical"
import StateButton from "../state-button"

import { RoutesEditor } from "../routes-editor"
import { preload, useSWRConfig } from "swr"

import dynamic from 'next/dynamic'
import { ToggleButton } from "../toggle-button"
import LoadingSpinner from "../loading-spinner"
import { ChangesCounter } from "../changes-counter"
import { findEntityReferencesFromEntities, findMentionsFromUsers, findWeakEntityReferences, getSearchkeysFromEntities, hasChanged } from "../utils"
import { ContentProps, EntityProps, SmallEntityProps, SmallUserProps } from "../../app/lib/definitions"
import { updateEntityContent } from "../../actions/entities"
import { useUser, useUsers } from "../../app/hooks/user"
import { compress, decompress } from "../compression"
import { ShowArticleChanges } from "../show-article-changes"
import { ShowArticleAuthors } from "../show-authors-changes"
import { SaveEditPopup } from "../save-edit-popup"
import { fetcher } from "../../app/hooks/utils"
import { SearchkeysEditor } from "../searchkeys-editor"
import { useRouteEntities } from "../../app/hooks/contents"
import { findMentions } from "../../actions/contents"
import { editContentClassName } from "../article-page"


const MyLexicalEditor = dynamic( () => import( './lexical-editor' ), { ssr: false } );


export const articleButtonClassname = "article-btn lg:text-base text-sm px-1 lg:px-2"


const initialValue = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"¡Este tema no tiene contenido! Si tenés información relevante o te interesa investigar el tema, editalo para agregar una primera versión. Cabildo Abierto te va a ","type":"text","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"pagar","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"link","version":1,"rel":"","target":"","title":null,"url":"/articulo?i=Cabildo_Abierto%3A_Remuneraciones"},{"detail":0,"format":0,"mode":"normal","style":"","text":" por tu contribución durante toda la vida del tema.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`


export const wikiEditorSettings = (readOnly: boolean, content: ContentProps, contentText: string) => {
    
    let initialData = null
    let emptyContent = contentText == "" || contentText == "Este artículo está vacío!"
    if(readOnly && emptyContent){
        initialData = initialValue
    } else {
        initialData = contentText
    }
        
    return {
        disableBeforeInput: false,
        emptyEditor: false,
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
        showTableOfContents: true,
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
        placeholder: "Explicá el tema del título o agregá información...",
        initialData: initialData,
        editorClassName: "content",
        isReadOnly: readOnly,
        content: content,
        isAutofocus: false,
        placeholderClassName: "ContentEditable__placeholder",
    }
}


type WikiEditorProps = {
    entity: EntityProps,
    content: ContentProps
    version: number,
    readOnly?: boolean,
    showingChanges?: boolean
    showingAuthors?: boolean
    setEditing: (arg0: boolean) => void
}


function findReferencesInClient(text: string, entities: SmallEntityProps[], users: SmallUserProps[]){
    const searchkeys = getSearchkeysFromEntities(entities)
    const weakReferences = findWeakEntityReferences(text, searchkeys)
    const mentions = findMentionsFromUsers(text, users)
    const entityReferences = findEntityReferencesFromEntities(text, entities)

    return {weakReferences: weakReferences, mentions: mentions, entityReferences: entityReferences}
}


const WikiEditor = ({content, entity, version, readOnly=false, showingChanges=false, showingAuthors=false, setEditing}: WikiEditorProps) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editingRoutes, setEditingRoutes] = useState(false)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const {mutate} = useSWRConfig()
    const [showingSaveEditPopup, setShowingSaveEditPopup] = useState(false)
    const [editingSearchkeys, setEditingSearchkeys] = useState(false)
    const {entities} = useRouteEntities([])
    const {users} = useUsers()

    const user = useUser()
    
    if(version == null || version >= entity.versions.length || version < 0){
        version = entity.versions.length-1
    }

    const contentText = decompress(content.compressedText)
    
    useEffect(() => {
        if(version > 0){
            const changesContentId = entity.versions[version-1].id
            preload("/api/content/"+changesContentId, fetcher)
        }
    }, [])

    if(user.isLoading){
        return <LoadingSpinner/>
    }

    async function saveEdit(claimsAuthorship: boolean, editMsg: string): Promise<{error?: string}>{
        if(!editor) return {error: "Ocurrió un error con el editor."}
        if(!entities || !users) return {error: "Ocurrió un error al guardar los cambios. Intentá de nuevo."}

        return await editor.read(async () => {
            let text
            try {
                text = JSON.stringify(editor.getEditorState())
            } catch {
                return {error: "Ocurrió un error con el editor."}
            }

            const {weakReferences, entityReferences, mentions} = findReferencesInClient(text, entities, users)

            const result = await updateEntityContent(
                entity.id, 
                user.user.id,
                claimsAuthorship,
                editMsg,
                compress(text),
                weakReferences,
                entityReferences,
                mentions
            )
            
            console.log("result", result)
            if(result.error) return {error: result.error}
            
            await mutate("/api/entity/"+entity.id)
            mutate("/api/entities")
            setShowingSaveEditPopup(false)
            setEditing(false)
            return {}
        })
    }

    const SaveEditButton = () => {
        return <button
            className={editContentClassName}
            onClick={(e) => {setShowingSaveEditPopup(true)}}
            disabled={!editorState || !hasChanged(editorState, contentText)}
        >
            Guardar edición
        </button>
    }
    
    const CancelEditButton = () => {
        return <button
            onClick={() => {setEditing(false)}}
            className={articleButtonClassname}
        >
            Cancelar edición
        </button>
    }

    return <>
        {!readOnly && <div className="flex flex-wrap items-center space-x-2 border-b">
            <SaveEditButton/>
            <ToggleButton
                className={articleButtonClassname}
                toggled={editingRoutes}
                setToggled={(v) => {setEditingRoutes(v); if(v) setEditingSearchkeys(false)}}
                text="Editar categorías"
            />
            <ToggleButton
                className={articleButtonClassname}
                toggled={editingSearchkeys}
                setToggled={(v) => {setEditingSearchkeys(v); if(v) setEditingRoutes(false)}}
                text="Editar sinónimos"
            />
            <CancelEditButton/>
        </div>}

        {showingSaveEditPopup && <SaveEditPopup
            editorState={editorState}
            currentVersion={contentText}
            onSave={saveEdit}
            onClose={() => {setShowingSaveEditPopup(false)}}
            entity={entity}
        />}

        {editingRoutes &&
        <div className="py-4">
            <RoutesEditor entity={entity} setEditing={setEditing}/>
        </div>}

        {editingSearchkeys && 
        <div className="py-4">
            <SearchkeysEditor entity={entity} setEditing={setEditing}/>    
        </div>}
        
        <div className="text-center">
        {showingChanges && readOnly && version > 0 && <ChangesCounter
            charsAdded={content.charsAdded} charsDeleted={content.charsDeleted}/>}
        {showingChanges && readOnly && version == 0 && <>Estás viendo la primera versión</>}
        </div>
        <div id="editor">
            {((!showingChanges && !showingAuthors) || version == 0) && 
            <div className="px-2 min-h-64" key={content.id+readOnly}>
                <MyLexicalEditor
                settings={wikiEditorSettings(readOnly, content, contentText)}
                setEditor={setEditor}
                setEditorState={setEditorState}
            />
            </div>}
            {(showingChanges && version > 0) &&
                <ShowArticleChanges
                    originalContent={content}
                    originalContentText={contentText}
                    entity={entity}
                    version={version}
                />
            }
            {(showingAuthors && version > 0) && 
                <ShowArticleAuthors
                    originalContent={content}
                    originalContentText={contentText}
                    entity={entity}
                    version={version}
                />
            }
        </div>
    </>
}

export default WikiEditor
