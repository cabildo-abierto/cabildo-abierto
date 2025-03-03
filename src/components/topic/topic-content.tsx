import {getCurrentVersion, hasChanged, hasEditPermission, PrettyJSON} from "../utils/utils";
import {ArticleOtherOptions} from "./article-other-options";
import {SetProtectionButton} from "./protection-button";
import {EditHistory} from "./edit-history";
import {FastPostProps, TopicProps, TopicVersionProps} from "../../app/lib/definitions";
import { useUser } from "../../hooks/user";
import {ToggleButton} from "../ui-utils/toggle-button";
import {wikiEditorSettings} from "../editor/wiki-editor";
import {NeedAccountPopup} from "../auth/need-account-popup";
import {useEffect, useState} from "react";
import {createTopicVersion} from "../../actions/write/topic";
import {compress} from "../utils/compression";
import {EditorState, LexicalEditor} from "lexical";
import {useSWRConfig} from "swr";
import {SaveEditPopup} from "./save-edit-popup";
import {CategoriesEditor} from "./categories-editor";
import {SynonymsEditor} from "./synonyms-editor";
import {ChangesCounter} from "./changes-counter";
import dynamic from "next/dynamic";
import {useLayoutConfig} from "../layout/layout-config-context";
import {CloseButton} from "../ui-utils/close-button";
import {smoothScrollTo} from "../editor/plugins/TableOfContentsPlugin";
import {ReplyToContent} from "../editor/plugins/CommentPlugin";
import {getCurrentContentVersion} from "./utils";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
const MyLexicalEditor = dynamic( () => import( '../editor/lexical-editor' ), { ssr: false } );

export const articleButtonClassname = "article-btn sm:min-w-24 sm:text-[15px] text-sm px-1 lg:px-2 py-1"


function topicVersionPropsToReplyToContent(topicVersion: TopicVersionProps, topicId: string): ReplyToContent {
    return {
        uri: topicVersion.uri,
        cid: topicVersion.cid,
        collection: "ar.com.cabildoabierto.topic",
        author: topicVersion.author,
        content: {
            ...topicVersion.content,
            topicVersion: {
                topic: {
                    id: topicId
                }
            }
        }
    }
}


export const TopicContent = ({
     topic, version, viewingContent, setViewingContent, selectedPanel,
     setSelectedPanel, quoteReplies, pinnedReplies, setPinnedReplies
}: {
    topic: TopicProps
    version: number
    viewingContent: boolean
    setViewingContent: (v: boolean) => void
    selectedPanel: string
    setSelectedPanel: (v: string) => void
    quoteReplies: FastPostProps[]
    pinnedReplies: string[]
    setPinnedReplies: (v: string[]) => void
}) => {
    const user = useUser()
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editingRoutes, setEditingRoutes] = useState(false)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const [editingSynonyms, setEditingSynonyms] = useState(false)
    const [showingNeedAccountPopup, setShowingNeedAccountPopup] = useState(false)
    const [showingSaveEditPopup, setShowingSaveEditPopup] = useState(false)
    const {mutate} = useSWRConfig()
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()

    useEffect(() => {
        const hash = window.location.hash
        if (hash) {
            const id = hash.split("#")[1]
            const scrollToElement = () => {
                const element = document.getElementById(id)
                if (element) {
                    smoothScrollTo(element)
                    setPinnedReplies([...pinnedReplies, id])
                } else {
                    setTimeout(scrollToElement, 100)
                }
            }
            scrollToElement()
        }
    }, [])

    const currentIndex = getCurrentVersion(topic)
    const isCurrent = version == currentIndex

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

            mutate("/api/topic/"+encodeURIComponent(topic.id))
            mutate("/api/topic/"+topic.id)
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

    const currentContentVersion = getCurrentContentVersion(topic, version)
    const contentVersion = topic.versions[currentContentVersion]

    const currentVersion = topic.versions[version]

    const editorId = contentVersion.uri+"-"+quoteReplies.map((r) => (r.cid.slice(0, 10))).join("-")

    const editorComp = <>
        {showingSaveEditPopup && <SaveEditPopup
            editorState={editorState}
            currentVersion={contentVersion}
            onSave={saveEdit}
            onClose={() => {setShowingSaveEditPopup(false)}}
            entity={topic}
        />}

        {editingRoutes &&
            <div className="py-4">
                <CategoriesEditor
                    topic={topic}
                    setEditing={(v: boolean) => {setEditingRoutes(v)}}
                />
            </div>
        }

        {editingSynonyms &&
            <div className="py-4">
                <SynonymsEditor topic={topic} setEditing={setEditingSynonyms}/>
            </div>
        }

        <div className="text-center">
            {selectedPanel == "changes" && version > 0 && <ChangesCounter
                    charsAdded={currentVersion.content.topicVersion.charsAdded}
                    charsDeleted={contentVersion.content.topicVersion.charsDeleted}
                />
            }
        </div>

        <div id="editor" className={"pb-2"}>
            {(((selectedPanel != "changes" || version == 0) && selectedPanel != "authors")) &&
                <div
                    id={editorId}
                    className={"px-2 " + (selectedPanel == "editing" ? "mb-32": "mb-8")}
                    key={contentVersion.cid+selectedPanel+viewingContent+editorId}
                >
                    <MyLexicalEditor
                        settings={wikiEditorSettings(
                            selectedPanel != "editing",
                            topicVersionPropsToReplyToContent(contentVersion, topic.id),
                            contentVersion.content.text,
                            contentVersion.content.format,
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

    return <div
        className={"w-full " + (selectedPanel == "editing" ? "" : " border-b") + (viewingContent ? " min-h-[500px]" : " min-h-[100px]")}
        id="information-start">

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
                            if (v) setEditingSynonyms(false)
                        }}
                        text="Editar categorías"
                    />
                    <ToggleButton
                        className={articleButtonClassname}
                        toggled={editingSynonyms}
                        setToggled={(v) => {
                            setEditingSynonyms(v)
                            if (v) setEditingRoutes(false)
                        }}
                        text="Editar sinónimos"
                    />
                    <ArticleOtherOptions
                        optionList={["change-name"]}
                        topic={topic}
                    />
                </>}

                {(user.user && user.user.editorStatus == "Administrator") && <>
                    <div className="flex justify-center py-2">
                        <SetProtectionButton entity={topic}/>
                    </div>
                </>}
            </div>
            {selectedPanel != "editing" && <CloseButton size="small" onClose={() => {
                setViewingContent(false);
                setPinnedReplies([])
                setLayoutConfig({...layoutConfig, openRightPanel: true, maxWidthCenter: "600px", defaultSidebarState: true, openSidebar: true})
                setSelectedPanel("none")
            }}/>}
        </div>}
        {selectedPanel == "history" && <div className="my-2 px-2 border-b">
            <EditHistory
                entity={topic}
                viewing={version}
            />
        </div>
        }
        <div
            onClick={() => {
                setViewingContent(true);
                setLayoutConfig((prev) => ({
                    ...prev, openSidebar: false, openRightPanel: false, maxWidthCenter: "800px", rightMinWidth: "275px"}));
            }}
            className={`relative group ${!viewingContent ? "min-h-[100px] max-h-[200px] overflow-y-clip bg-[var(--background)] hover:bg-[var(--background-dark)] cursor-pointer" : ""}`}
        >
            {editorComp}
            {!viewingContent && (
                <div
                    className="absolute space-x-1 group-hover:flex bottom-0 right-0 bg-opacity-80 text-[var(--text)] text-sm px-2 py-1 rounded"
                >
                    <div className={"flex items-center w-full justify-end space-x-2 text-sm text-[var(--text-light)]"}>
                        <div>expandir</div> <FullscreenIcon fontSize={"small"}/>
                    </div>
                </div>
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