import {currentVersion, hasChanged, hasEditPermission} from "../utils";
import {ArticleOtherOptions} from "./article-other-options";
import {SetProtectionButton} from "../protection-button";
import {EntityCategories} from "../categories";
import {getTopicTitle} from "./utils";
import {EditHistory} from "../edit-history";
import {FastPostProps, TopicProps} from "../../app/lib/definitions";
import { useUser } from "../../hooks/user";
import {ToggleButton} from "../toggle-button";
import {wikiEditorSettings} from "../editor/wiki-editor";
import {NeedAccountPopup} from "../need-account-popup";
import {useState} from "react";
import StateButton from "../state-button";
import {createTopicVersion} from "../../actions/topics";
import {compress} from "../compression";
import {EditorState, LexicalEditor} from "lexical";
import {useSWRConfig} from "swr";
import {SaveEditPopup} from "../save-edit-popup";
import {RoutesEditor} from "../routes-editor";
import {SearchkeysEditor} from "../searchkeys-editor";
import {ChangesCounter} from "../changes-counter";
import {ShowArticleChanges} from "../show-article-changes";
import {ShowArticleAuthors} from "../show-authors-changes";
import dynamic from "next/dynamic";
import {useLayoutConfig} from "../layout/layout-config-context";
import {CloseButton} from "../ui-utils/close-button";
const MyLexicalEditor = dynamic( () => import( '../editor/lexical-editor' ), { ssr: false } );

export const articleButtonClassname = "article-btn lg:text-base text-sm px-1 lg:px-2 py-1"


export const TopicContent = ({
                                 topic, version, viewingContent, setViewingContent, selectedPanel, setSelectedPanel, quoteReplies, pinnedReplies, setPinnedReplies}: {
    topic: TopicProps, version: number, viewingContent: boolean, setViewingContent: (v: boolean) => void, selectedPanel: string, setSelectedPanel: (v: string) => void, quoteReplies: FastPostProps[], pinnedReplies: string[], setPinnedReplies: (v: string[]) => void}) => {
    const user = useUser()
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editingRoutes, setEditingRoutes] = useState(false)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const [editingSearchkeys, setEditingSearchkeys] = useState(false)
    const [showingNeedAccountPopup, setShowingNeedAccountPopup] = useState(false)
    const [showingSaveEditPopup, setShowingSaveEditPopup] = useState(false)
    const {mutate} = useSWRConfig()
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()

    const lastUpdated = topic.versions[topic.versions.length-1].content.record.createdAt

    const currentIndex = currentVersion(topic)
    const isCurrent = version == currentIndex

    const content = topic.versions[version]

    async function saveEdit(claimsAuthorship: boolean, editMsg: string): Promise<{error?: string}>{
        if(!editor) return {error: "Ocurrió un error con el editor."}

        return await editor.read(async () => {
            let text
            try {
                text = JSON.stringify(editor.getEditorState())
            } catch {
                return {error: "Ocurrió un error con el editor."}
            }

            const formData = new FormData()
            formData.set("data", new File([compress(text)], ""))

            const result = await createTopicVersion(
                {
                    id: topic.id,
                    text: formData,
                    format: "lexical-compressed",
                    claimsAuthorship,
                    message: editMsg
                }
            )

            if(!result) return {error: "Ocurrió un error al guardar los cambios. e02."}
            if(result.error) return {error: result.error}

            mutate("/api/topic/"+topic.id)
            mutate("/api/topics")
            setShowingSaveEditPopup(false)
            setSelectedPanel("none")
            return {}
        })
    }

    const SaveEditButton = () => {
        return <button
            className={articleButtonClassname}
            onClick={(e) => {setShowingSaveEditPopup(true)}}
            disabled={!editorState/* TO DO || !hasChanged(editorState, contentText)*/}
        >
            Guardar edición
        </button>
    }

    const EditButton = () => {
        async function onEdit(){
            if(user.user == null){
                setShowingNeedAccountPopup(true)
            } else {
                if(selectedPanel == "editing"){
                    setSelectedPanel("none")
                } else {
                    setSelectedPanel("editing")
                }
            }
        }

        return <button
            onClick={() => {onEdit()}}
            disabled={!isCurrent}
            className={articleButtonClassname}
        >
            {selectedPanel == "editing" ? "Cancelar edición" : (hasEditPermission(user.user, topic.protection) ? "Editar" : "Proponer edición")}
        </button>
    }

    const ViewHistoryButton = () => {
        return <ToggleButton
            text="Historial"
            className={articleButtonClassname}
            setToggled={(v) => {if(v) setSelectedPanel("history"); else setSelectedPanel("none")}}
            toggled={selectedPanel == "history"}
        />
    }

    const ViewLastChangesButton = () => {
        return <ToggleButton
            text="Cambios"
            className={articleButtonClassname}
            setToggled={(v) => {if(v) setSelectedPanel("changes"); else setSelectedPanel("none")}}
            toggled={selectedPanel == "changes"}
        />
    }

    const ViewAuthorsButton = () => {
        return <ToggleButton
            text="Autores"
            className={articleButtonClassname}
            setToggled={(v) => {if(v) setSelectedPanel("authors"); else setSelectedPanel("none")}}
            toggled={selectedPanel == "authors"}
        />
    }

    const RecomputeContributionsButton = () => {
        return <StateButton
            variant="text"
            text1="Recalcular contribuciones"
            text2="Recalculando..."
            handleClick={async () => {
                //return await recomputeEntityContributions(entityId)
                return {}
            }}
        />
    }

    const RemoveHistoryButton = () => {
        return <StateButton
            variant="text"
            text1="Eliminar historial"
            text2="Eliminando..."
            handleClick={async () => {
                /*const {error} = await deleteEntityHistory(entityId, false);
                mutate("/api/entity/"+entityId)
                return {error}*/
                return {}
            }}
        />
    }


    const RebootArticleButton = () => {
        return <StateButton
            variant="text"
            text1="Reiniciar"
            text2="Reiniciando..."
            handleClick={async () => {
                /*const {error} = await deleteEntityHistory(entityId, true);
                mutate("/api/entity/"+entityId)
                return {error}*/
                return {}
            }}
        />
    }

    const UpdateWeakReferencesButton = () => {
        return <StateButton
            variant="text"
            text1="Actualizar weak references"
            text2="Actualizando..."
            handleClick={async () => {
                //return await updateAllWeakReferences()
                return {}
            }}
        />
    }

    const originalContent = {cid: content.content.record.cid, uri: content.content.record.uri, diff: content.diff, content: {text: content.content.text}}

    const editorComp = <>
        {showingSaveEditPopup && <SaveEditPopup
            editorState={editorState}
            currentVersion={content}
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
            {selectedPanel == "changes" && version > 0 && <ChangesCounter
                charsAdded={content.charsAdded} charsDeleted={content.charsDeleted}/>}
        </div>
        <div id="editor" className={"pb-2"}>
            {(((selectedPanel != "changes" || version == 0) && selectedPanel != "authors")) &&
                <div className="px-2" key={content.content.record.cid+selectedPanel+viewingContent}>
                    <MyLexicalEditor
                        settings={wikiEditorSettings(
                            selectedPanel != "editing",
                            content.content.record,
                            content.content.text,
                            content.content.format,
                            viewingContent,
                            viewingContent,
                            quoteReplies,
                            pinnedReplies,
                            setPinnedReplies
                        )}
                        setEditor={setEditor}
                        setEditorState={setEditorState}
                    />
                </div>
            }
            {/*(selectedPanel == "changes" && version > 0) &&
                <ShowArticleChanges
                    originalContent={originalContent}
                    originalContentText={content.content.text}
                    entity={topic}
                    version={version}
                />
            */}
            {/*(selectedPanel == "authors") &&
                <ShowArticleAuthors
                    originalContent={originalContent}
                    originalContentText={content.content.text}
                    topic={topic}
                    version={version}
                />
            */}
        </div>
    </>

    return <div className={"w-full " + (selectedPanel == "editing" ? "" : " border-b") + (viewingContent ? " min-h-[500px]" : " min-h-[100px]")} id="information-start">

        {viewingContent && <div className="flex justify-between items-center border-b">
            <div className="flex flex-wrap w-full items-center">
                {selectedPanel == "editing" && <SaveEditButton/>}
                {isCurrent && <EditButton/>}
                {selectedPanel != "editing" && <>
                    <ViewHistoryButton/>
                    <ViewLastChangesButton/>
                    <ViewAuthorsButton/>
                </>}

                {selectedPanel == "editing" && <>
                    <ToggleButton
                        className={articleButtonClassname}
                        toggled={editingRoutes}
                        setToggled={(v) => {
                            setEditingRoutes(v);
                            if (v) setEditingSearchkeys(false)
                        }}
                        text="Editar categorías"
                    />
                    <ToggleButton
                        className={articleButtonClassname}
                        toggled={editingSearchkeys}
                        setToggled={(v) => {
                            setEditingSearchkeys(v);
                            if (v) setEditingRoutes(false)
                        }}
                        text="Editar sinónimos"
                    />
                    <ArticleOtherOptions
                        optionList={["change-name"]}
                        topic={topic}
                    />
                </>}

                {(user.user && (user.user.editorStatus == "Administrator")) &&
                    <div className="flex justify-center">
                        <RecomputeContributionsButton/>
                    </div>
                }

                {(user.user && user.user.editorStatus == "Administrator") && <>
                    <div className="flex justify-center py-2">
                        <SetProtectionButton entity={topic}/>
                    </div>
                    <div className="flex justify-center py-2">
                        <UpdateWeakReferencesButton/>
                    </div>
                    <div className="flex justify-center py-2">
                        <RemoveHistoryButton/>
                    </div>
                    <div className="flex justify-center py-2">
                        <RebootArticleButton/>
                    </div>
                </>}
            </div>
            {selectedPanel != "editing" && <CloseButton size="small" onClose={() => {
                setViewingContent(false);
                setPinnedReplies([])
                setLayoutConfig({distractionFree: false, ...layoutConfig})
                setSelectedPanel("none")
            }}/>}
        </div>}
        {selectedPanel == "categories" && <div className="px-2 content-container my-2">
            <EntityCategories
                categories={topic.versions[version].categories}
                name={getTopicTitle(topic)}
            />
        </div>}
        {selectedPanel == "history" && <div className="my-2 px-2">
            <EditHistory
                entity={topic}
                viewing={version}
            />
        </div>
        }
        <div
            onClick={() => {
                setViewingContent(true);
                setLayoutConfig({distractionFree: true, ...layoutConfig});
            }}
            className={`relative group ${!viewingContent ? "min-h-[100px] max-h-[200px] overflow-y-clip bg-[var(--background)] cursor-pointer hover:bg-gradient-to-b hover:from-[var(--background)] hover:to-[var(--background-dark)]" : ""}`}
        >
            {editorComp}
            {!viewingContent && (
                <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[var(--background-dark)] bg-opacity-80 text-[var(--text)] text-sm px-2 py-1 rounded hidden group-hover:block">
                    Expandir
                </span>
            )}
        </div>

        <NeedAccountPopup
            text="Necesitás una cuenta para hacer ediciones."
            open={showingNeedAccountPopup}
            onClose={() => {
                setShowingNeedAccountPopup(false)
            }}
        />
    </div>
}