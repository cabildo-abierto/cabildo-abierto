import Button from "@mui/material/Button";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {DateSince} from "../date";
import {CustomLink as Link} from "../custom-link";
import {articleUrl, currentVersion, hasChanged, hasEditPermission} from "../utils";
import {ArticleOtherOptions} from "./article-other-options";
import {SetProtectionButton} from "../protection-button";
import {EntityCategories} from "../categories";
import {getTopicTitle} from "./utils";
import {EditHistory} from "../edit-history";
import { TopicProps } from "../../app/lib/definitions";
import { useUser } from "../../hooks/user";
import {ToggleButton} from "../toggle-button";
import {wikiEditorSettings} from "../editor/wiki-editor";
import {NeedAccountPopup} from "../need-account-popup";
import {useState} from "react";
import StateButton from "../state-button";
import {smoothScrollTo} from "../editor/plugins/TableOfContentsPlugin";
import {createTopicVersion} from "../../actions/topics";
import {compress, decompress} from "../compression";
import {EditorState, LexicalEditor} from "lexical";
import {useSWRConfig} from "swr";
import {SaveEditPopup} from "../save-edit-popup";
import {RoutesEditor} from "../routes-editor";
import {SearchkeysEditor} from "../searchkeys-editor";
import {ChangesCounter} from "../changes-counter";
import {ShowArticleChanges} from "../show-article-changes";
import {ShowArticleAuthors} from "../show-authors-changes";
import dynamic from "next/dynamic";
const MyLexicalEditor = dynamic( () => import( '../editor/lexical-editor' ), { ssr: false } );

export const articleButtonClassname = "article-btn lg:text-base text-sm px-1 lg:px-2 py-1"


export const TopicContent = ({
                                 topic, version, selectedPanel, setSelectedPanel}: {
    topic: TopicProps, version: number, selectedPanel: string, setSelectedPanel: (v: string) => void}) => {
    const user = useUser()
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editingRoutes, setEditingRoutes] = useState(false)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const [editingSearchkeys, setEditingSearchkeys] = useState(false)
    const [showingNeedAccountPopup, setShowingNeedAccountPopup] = useState(false)
    const [showingSaveEditPopup, setShowingSaveEditPopup] = useState(false)
    const {mutate} = useSWRConfig()

    const lastUpdated = topic.versions[topic.versions.length-1].content.record.createdAt

    const currentIndex = currentVersion(topic)
    const isCurrent = version == currentIndex

    const content = topic.versions[version]

    const contentText = decompress(content.content.text)

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
            setSelectedPanel("none")
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

    const DeleteArticleButton = () => {
        return <StateButton
            text1="Eliminar tema"
            text2="Eliminando..."
            variant="text"
            handleClick={async () => {
                /*const {error} = await deleteEntity(entityId, user.user.id)
                mutate("/api/entities")
                router.push("/inicio")
                return {error}*/
                return {}
            }}
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

    function onGoToDiscussion() {
        const targetElement = document.getElementById('discussion-start');

        return smoothScrollTo(targetElement, 300)
    }

    const info = <>
        <div className="flex justify-between items-center">
            {<div className="flex flex-col link text-xs sm:text-sm">

                <span className="text-[var(--text-light)] mt-2 flex items-center">
                    <div className="mr-1 flex items-center"><AccessTimeIcon fontSize="inherit"/></div> <span>Última actualización <DateSince date={lastUpdated}/>.</span>
                </span>

                {!isCurrent && <div className="flex text-[var(--text-light)]">
                    <span className="mr-1">Estás viendo la versión {version} (publicada <DateSince date={topic.versions[version].content.record.createdAt}/>).</span>
                    <span><Link href={articleUrl(topic.id)}>Ir a la versión actual</Link>.</span>
                </div>
                }

            </div>}
        </div>
    </>

    const originalContent = {cid: content.content.record.cid, uri: content.content.record.uri, diff: content.diff, content: {text: content.content.text}}

    const editorComp = <>

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
            {selectedPanel == "changes" && version > 0 && <ChangesCounter
                charsAdded={content.charsAdded} charsDeleted={content.charsDeleted}/>}
        </div>
        <div id="editor">
            {(((selectedPanel != "changes" || version == 0) && selectedPanel != "authors")) &&
                <div className="px-2" key={content.content.record.cid+selectedPanel}>
                    <MyLexicalEditor
                        settings={wikiEditorSettings(selectedPanel != "editing", content.content.record, contentText)}
                        setEditor={setEditor}
                        setEditorState={setEditorState}
                    />
                </div>
            }
            {(selectedPanel == "changes" && version > 0) &&
                <ShowArticleChanges
                    originalContent={originalContent}
                    originalContentText={contentText}
                    entity={topic}
                    version={version}
                />
            }
            {(selectedPanel == "authors") &&
                <ShowArticleAuthors
                    originalContent={originalContent}
                    originalContentText={contentText}
                    topic={topic}
                    version={version}
                />
            }
        </div>
    </>

    return <div className={"w-full py-4" + (selectedPanel == "editing" ? "" : " border-b")} id="information-start">
        <div className={"flex flex-col px-4"}>
            <div className="flex justify-between mb-2">
                <div>
                    <h3 className="">
                        Consenso
                    </h3>
                </div>

                <div className="text-[var(--text-light)]">
                    {selectedPanel != "editing" &&
                        <Button variant="outlined" onClick={onGoToDiscussion} size="small" color="inherit"
                                endIcon={<ArrowDownwardIcon/>}>
                            Discusión
                        </Button>}
                </div>
            </div>
            <div className="text-[var(--text-light)] text-xs sm:text-sm">
                Si no estás de acuerdo con algo editalo o comentá. También podés agregar información.
            </div>
            {info}
        </div>

        <div className="">
            <div className="flex flex-wrap w-full items-center border-b mt-4">
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
                        setToggled={(v) => {setEditingRoutes(v); if(v) setEditingSearchkeys(false)}}
                        text="Editar categorías"
                    />
                    <ToggleButton
                        className={articleButtonClassname}
                        toggled={editingSearchkeys}
                        setToggled={(v) => {setEditingSearchkeys(v); if(v) setEditingRoutes(false)}}
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
                        <DeleteArticleButton/>
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
                </>
                }
            </div>
        </div>
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
        <div className={""}>
            {editorComp}
        </div>
        <NeedAccountPopup
            text="Necesitás una cuenta para hacer ediciones."
            open={showingNeedAccountPopup}
            onClose={() => {setShowingNeedAccountPopup(false)}}
        />
    </div>
}