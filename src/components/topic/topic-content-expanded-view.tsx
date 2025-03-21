import {FastPostProps, TopicProps} from "../../app/lib/definitions";
import {useEffect, useState} from "react";
import {useSWRConfig} from "swr";
import {EditorState, LexicalEditor} from "lexical";
import {TopicContentExpandedViewHeader, WikiEditorState} from "./topic-content-expanded-view-header";
import {wikiEditorSettings} from "../editor/wiki-editor";
import dynamic from "next/dynamic";
import {topicVersionPropsToReplyToContent} from "./topic-content";
import {SaveEditPopup} from "./save-edit-popup";
import {compress} from "../utils/compression";
import {createTopicVersion} from "../../actions/write/topic";
import {TopicContentHistory} from "./topic-content-history";
import {SynonymsEditor} from "./synonyms-editor";
import { CategoriesEditor } from "./categories-editor";
import {ShowTopicChanges} from "./show-topic-changes";
import {ShowTopicAuthors} from "./show-topic-authors";
import {useTopicFeed, useTopicVersion} from "../../hooks/contents";
import LoadingSpinner from "../ui-utils/loading-spinner";
import {isQuotePost} from "../utils/uri";
import {useSearchParams} from "next/navigation";
import {ErrorPage} from "../ui-utils/error-page";
const MyLexicalEditor = dynamic( () => import( '../editor/lexical-editor' ), { ssr: false } );


export type SmallTopicVersionProps = {
    uri: string
    content: {
        text: string
        format?: string
        record: {
            createdAt: Date
            cid: string
        }
    }
}


export const TopicContentExpandedViewWithVersion = ({
    topic,
    topicVersion,
    pinnedReplies,
    setPinnedReplies,
    wikiEditorState,
    setWikiEditorState,
}: {
    topicVersion: SmallTopicVersionProps
    topic: TopicProps
    pinnedReplies: string[]
    setPinnedReplies: (v: string[]) => void
    wikiEditorState: WikiEditorState
    setWikiEditorState: (v: WikiEditorState) => void
}) => {
    const feed = useTopicFeed(topic.id)
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const [showingSaveEditPopup, setShowingSaveEditPopup] = useState(false)
    const {mutate} = useSWRConfig()
    const [quoteReplies, setQuoteReplies] = useState<FastPostProps[] | null>(null)

    useEffect(() => {
        if(feed.feed){
            const q = feed.feed.replies.filter((r) => {
                return isQuotePost(r) && (r as FastPostProps).content.post.quote != undefined
            }) as FastPostProps[]
            if(!quoteReplies || q.length != quoteReplies.length){
                setQuoteReplies(q)
            }
        }
    }, [feed, quoteReplies])

    const editorId = topicVersion.uri+"-"+(quoteReplies ? quoteReplies.map((r) => (r.cid.slice(0, 10))).join("-") : "")

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

            if(!result) return {error: "Ocurrió un error al guardar los cambios."}
            if(result.error) return {error: result.error}

            await mutate("/api/topic/"+topic.id)
            await mutate("/api/topic-history/"+topic.id)
            setShowingSaveEditPopup(false)
            setWikiEditorState("normal")
            return {}
        })
    }

    const saveEnabled = editorState && JSON.stringify(editorState) != topicVersion.content.text

    return <div className={"w-full"}>
        <TopicContentExpandedViewHeader
            topic={topic}
            topicVersion={topicVersion}
            wikiEditorState={wikiEditorState}
            setWikiEditorState={setWikiEditorState}
            setPinnedReplies={setPinnedReplies}
            setShowingSaveEditPopup={setShowingSaveEditPopup}
            saveEnabled={saveEnabled}
        />
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
                    key={topicVersion.uri + wikiEditorState + editorId}
                >
                    <MyLexicalEditor
                        settings={wikiEditorSettings(
                            wikiEditorState != "editing",
                            topicVersionPropsToReplyToContent(topicVersion, topic.id),
                            topicVersion.content.text,
                            topicVersion.content.format,
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
                {wikiEditorState == "changes" &&
                    <ShowTopicChanges
                        topic={topic}
                        topicVersion={topicVersion}
                    />
                }
                {wikiEditorState == "authors" &&
                    <ShowTopicAuthors
                        topic={topic}
                        topicVersion={topicVersion}
                    />
                }
            </div>
        }

        {showingSaveEditPopup && <SaveEditPopup
            editorState={editorState}
            currentVersion={topic.currentVersion}
            onSave={saveEdit}
            onClose={() => {setShowingSaveEditPopup(false)}}
            entity={topic}
        />}
    </div>
}


export const TopicContentExpandedView = ({
    topic,
    pinnedReplies,
    setPinnedReplies,
    wikiEditorState,
    setWikiEditorState,
}: {
    topic: TopicProps
    pinnedReplies: string[]
    setPinnedReplies: (v: string[]) => void
    wikiEditorState: WikiEditorState
    setWikiEditorState: (v: WikiEditorState) => void
}) => {
    const params = useSearchParams()
    const did: string = params.get("did")
    const rkey: string = params.get("rkey")
    const topicVersion = useTopicVersion(did, rkey)

    if(topicVersion.isLoading){
        return <div className={"mt-8"}>
            <LoadingSpinner/>
        </div>
    }

    if(!topicVersion.topicVersion){
        return <div className={"mt-8"}>
            <ErrorPage>
                Ocurrió un error al obtener el contenido.
            </ErrorPage>
        </div>
    }

    return <TopicContentExpandedViewWithVersion
        topic={topic}
        pinnedReplies={pinnedReplies}
        setPinnedReplies={setPinnedReplies}
        wikiEditorState={wikiEditorState}
        setWikiEditorState={setWikiEditorState}
        topicVersion={topicVersion.topicVersion}
    />
}