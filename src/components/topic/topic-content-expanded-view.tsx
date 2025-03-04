import {FastPostProps, TopicProps, TopicVersionProps} from "../../app/lib/definitions";
import {useState} from "react";
import {useSWRConfig} from "swr";
import {EditorState, LexicalEditor} from "lexical";
import {TopicContentExpandedViewHeader, WikiEditorState} from "./topic-content-expanded-view-header";
import {wikiEditorSettings} from "../editor/wiki-editor";
import {getCurrentContentVersion} from "./utils";
import dynamic from "next/dynamic";
import {topicVersionPropsToReplyToContent} from "./topic-content";
import {SaveEditPopup} from "./save-edit-popup";
import {compress} from "../utils/compression";
import {createTopicVersion} from "../../actions/write/topic";
import {TopicContentHistory} from "./topic-content-history";
import {SynonymsEditor} from "./synonyms-editor";
import { CategoriesEditor } from "./categories-editor";
const MyLexicalEditor = dynamic( () => import( '../editor/lexical-editor' ), { ssr: false } );




export const TopicContentExpandedView = ({
    topic,
    version,
    quoteReplies,
    pinnedReplies,
    setPinnedReplies,
    wikiEditorState,
    setWikiEditorState,
}: {
    topic: TopicProps
    version: number
    quoteReplies?: FastPostProps[]
    pinnedReplies: string[]
    setPinnedReplies: (v: string[]) => void
    wikiEditorState: WikiEditorState
    setWikiEditorState: (v: WikiEditorState) => void
}) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const [showingSaveEditPopup, setShowingSaveEditPopup] = useState(false)

    const {mutate} = useSWRConfig()

    const currentContentVersion = getCurrentContentVersion(topic, version)
    const contentVersion = topic.versions[currentContentVersion]

    const editorId = contentVersion.uri+"-"+quoteReplies.map((r) => (r.cid.slice(0, 10))).join("-")

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
            setWikiEditorState("normal")
            return {}
        })
    }

    const saveEnabled = editorState && JSON.stringify(editorState) != contentVersion.content.text

    return <div className={"w-full"}>
        <div className={""}>
            <TopicContentExpandedViewHeader
                topic={topic}
                wikiEditorState={wikiEditorState}
                setWikiEditorState={setWikiEditorState}
                setPinnedReplies={setPinnedReplies}
                setShowingSaveEditPopup={setShowingSaveEditPopup}
                saveEnabled={saveEnabled}
            />
        </div>
        {wikiEditorState == "history" && <TopicContentHistory
            topic={topic}
        />}
        {wikiEditorState == "editing-synonyms" &&
            <SynonymsEditor
                topic={topic}
                onClose={() => {setWikiEditorState("normal")}}
            />
        }
        {wikiEditorState == "editing-categories" &&
            <CategoriesEditor
                topic={topic}
                onClose={() => {setWikiEditorState("normal")}}
            />
        }
        {["normal", "authors", "changes", "editing"].includes(wikiEditorState) &&
            <div id="editor" className={"pb-2 min-h-[300px]"}>
                {["editing", "normal"].includes(wikiEditorState) && <div
                    id={editorId}
                    className={"mx-2 "+(wikiEditorState == "editing" ? "mb-32" : "mb-8")}
                    key={contentVersion.cid + wikiEditorState + editorId}
                >
                    <MyLexicalEditor
                        settings={wikiEditorSettings(
                            wikiEditorState != "editing",
                            topicVersionPropsToReplyToContent(contentVersion, topic.id),
                            contentVersion.content.text,
                            contentVersion.content.format,
                            true,
                            true,
                            quoteReplies,
                            pinnedReplies,
                            setPinnedReplies
                        )}
                        setEditor={setEditor}
                        setEditorState={setEditorState}
                    />
                </div>}
                {wikiEditorState == "changes" && <div className={"mt-4 text-center"}>
                    Sin implementar
                </div>
                }
                {wikiEditorState == "authors" && <div className={"mt-4 text-center"}>
                    Sin implementar
                </div>
                }
            </div>
        }

        {showingSaveEditPopup && <SaveEditPopup
            editorState={editorState}
            currentVersion={contentVersion}
            onSave={saveEdit}
            onClose={() => {setShowingSaveEditPopup(false)}}
            entity={topic}
        />}
    </div>
}