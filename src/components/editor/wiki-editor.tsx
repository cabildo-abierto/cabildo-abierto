"use client"
import { useState } from "react"
import { EditorState, LexicalEditor } from "lexical"

import { RoutesEditor } from "../routes-editor"

import dynamic from 'next/dynamic'
import { ToggleButton } from "../toggle-button"
import { ChangesCounter } from "../changes-counter"
import {
    currentVersion,
    hasChanged
} from "../utils"
import { TopicProps} from "../../app/lib/definitions"
import {compress, decompress} from "../compression"
import { ShowArticleChanges } from "../show-article-changes"
import { ShowArticleAuthors } from "../show-authors-changes"
import { SaveEditPopup } from "../save-edit-popup"
import { SearchkeysEditor } from "../searchkeys-editor"
import { SettingsProps } from "./lexical-editor"
import { useSWRConfig } from "swr"
import {createTopicVersion} from "../../actions/topics";


const MyLexicalEditor = dynamic( () => import( './lexical-editor' ), { ssr: false } );


export const articleButtonClassname = "article-btn lg:text-base text-sm px-1 lg:px-2 py-1"


const initialValue = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"¡Este tema no tiene contenido! Si tenés información relevante o te interesa investigar el tema, editalo para agregar una primera versión.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`


export const wikiEditorSettings = (readOnly: boolean, content: {title?: string, parentEntityId?: string, cid: string, text?: string, childrenContents?: any[]}, contentText: string): SettingsProps => {
    
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
        allowImages: true,
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
        content: {...content, type: "Topic"},
        isAutofocus: false,
        placeholderClassName: "ContentEditable__placeholder",
        imageClassName: "",
        preventLeave: true
    }
}


type WikiEditorProps = {
    topic: TopicProps
    version: number,
    readOnly?: boolean,
    showingChanges?: boolean
    showingAuthors?: boolean
    setEditing: (arg0: boolean) => void
}


const WikiEditor = ({topic, version, readOnly=false, showingChanges=false, showingAuthors=false, setEditing}: WikiEditorProps) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editingRoutes, setEditingRoutes] = useState(false)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const [showingSaveEditPopup, setShowingSaveEditPopup] = useState(false)
    const [editingSearchkeys, setEditingSearchkeys] = useState(false)
    const {mutate} = useSWRConfig()
    
    if(version == null || version >= topic.versions.length || version < 0){
        version = currentVersion(topic)
    }

    const content = topic.versions[version]

    const contentText = decompress(content.content.text)
    
    /* TO DO: Recuperar useEffect(() => {
        if(version > 0){
            const changesContentId = entity.versions[version-1].cid
            preload("/api/content/"+changesContentId, fetcher)
        }
    }, [])*/

    async function saveEdit(claimsAuthorship: boolean, editMsg: string): Promise<{error?: string}>{
        if(!editor) return {error: "Ocurrió un error con el editor."}

        return await editor.read(async () => {
            let text
            try {
                text = JSON.stringify(editor.getEditorState())
            } catch {
                return {error: "Ocurrió un error con el editor."}
            }

            const result = await createTopicVersion(
                {
                    id: topic.id,
                    text: compress(text),
                    claimsAuthorship,
                    message: editMsg
                }
            )
            
            if(!result) return {error: "Ocurrió un error al guardar los cambios. e02."}
            if(result.error) return {error: result.error}
            
            mutate("/api/topic/"+topic.id)
            mutate("/api/topics")
            setShowingSaveEditPopup(false)
            setEditing(false)
            return {}
        })
        return {}
    }

    const SaveEditButton = () => {
        return <button
            className={articleButtonClassname}
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
            entity={topic}
        />}

        {editingRoutes &&
        <div className="py-4">
            <RoutesEditor topic={topic} setEditing={(v: boolean) => {setEditingRoutes(v)}}/>
        </div>}

        {editingSearchkeys && 
        <div className="py-4">
            <SearchkeysEditor entity={topic} setEditing={setEditingSearchkeys}/>
        </div>}
        
        <div className="text-center">
        {showingChanges && readOnly && version > 0 && <ChangesCounter
            charsAdded={content.charsAdded} charsDeleted={content.charsDeleted}/>}
        {showingChanges && readOnly && version == 0 && <>Estás viendo la primera versión</>}
        </div>
        <div id="editor">
            {(((!showingChanges || version == 0) && !showingAuthors)) && 
            <div className="px-2" key={content.cid+readOnly}>
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
                    entity={topic}
                    version={version}
                />
            }
            {(showingAuthors) && 
                <ShowArticleAuthors
                    originalContent={content}
                    originalContentText={contentText}
                    topic={topic}
                    version={version}
                />
            }
        </div>
    </>
}

export default WikiEditor
