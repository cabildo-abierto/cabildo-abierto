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
import { hasChanged } from "../utils"
import { ContentProps, EntityProps } from "../../app/lib/definitions"
import { updateEntity } from "../../actions/entities"
import { useUser } from "../../app/hooks/user"
import { compress, decompress } from "../compression"
import { ShowArticleChanges } from "../show-article-changes"
import { ShowArticleAuthors } from "../show-authors-changes"
import { SaveEditPopup } from "../save-edit-popup"
import { fetcher } from "../../app/hooks/utils"


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


const WikiEditor = ({content, entity, version, readOnly=false, showingChanges=false, showingAuthors=false, setEditing}: WikiEditorProps) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editingRoutes, setEditingRoutes] = useState(false)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const {mutate} = useSWRConfig()
    const [showingSaveEditPopup, setShowingSaveEditPopup] = useState(false)
    const [errorOnSubmit, setErrorOnSubmit] = useState(false)
    const [editingSearchkeys, setEditingSearchkeys] = useState(false)

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

    async function saveEdit(claimsAuthorship: boolean, editMsg: string): Promise<boolean>{
        if(editor){
            const result = editor.read(async () => {
                setErrorOnSubmit(false)
                if(user.user){
                    const newContent = await updateEntity(
                        entity.id, 
                        user.user.id,
                        claimsAuthorship,
                        editMsg,
                        compress(JSON.stringify(editor.getEditorState())),
                        content.categories
                    )
                    mutate("/api/entities")
                    mutate("/api/entity/"+entity.id)
                    mutate("/api/contributions/"+entity.id)
                    if(newContent){
                        setShowingSaveEditPopup(false)
                        setEditing(false)
                        return true
                    } else {
                        setErrorOnSubmit(true)
                        return false
                    }
                } else {
                    setErrorOnSubmit(true)
                    return false
                }
            })
            return result
        }
        return false
    }

    const SaveEditButton = () => {
        return <StateButton
            className={articleButtonClassname}
            text1="Guardar edición"
            text2="Guardando..."
            handleClick={async (e) => {setShowingSaveEditPopup(true); return false}}
            disabled={!editorState || !hasChanged(editorState, contentText)}
        />
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
            <ToggleButton
                className={articleButtonClassname}
                toggled={editingRoutes}
                setToggled={setEditingRoutes}
                text="Editar categorías"
            />
            {/*<ToggleButton
                className={articleButtonClassname}
                toggled={editingSearchkeys}
                setToggled={setEditingSearchkeys}
                text="Editar sinónimos"
            />*/}
            <CancelEditButton/>
            <SaveEditButton/>
        </div>}
        {showingSaveEditPopup && <SaveEditPopup
            editorState={editorState}
            currentVersion={contentText}
            onSave={saveEdit}
            onClose={() => {setShowingSaveEditPopup(false); setErrorOnSubmit(false)}}
            entity={entity}
            errorOnSubmit={errorOnSubmit}
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
            {((!showingChanges && !showingAuthors) || version == 0) && 
            <div className="px-2 min-h-64">
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
