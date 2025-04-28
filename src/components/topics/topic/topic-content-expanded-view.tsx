import {useEffect, useState} from "react";
import {useSWRConfig} from "swr";
import {EditorState, LexicalEditor} from "lexical";
import {TopicContentExpandedViewHeader, WikiEditorState} from "./topic-content-expanded-view-header";
import {SaveEditPopup} from "./save-edit-popup";
import {compress} from "@/utils/compression";
import {TopicContentHistory} from "./topic-content-history";
import {SynonymsEditor} from "./synonyms-editor";
import { CategoriesEditor } from "./categories-editor";
import {ShowTopicChanges} from "./show-topic-changes";
import {ShowTopicAuthors} from "./show-topic-authors";
import {useTopicFeed, useTopicVersion} from "@/hooks/api";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {useSearchParams} from "next/navigation";
import {editorStateToMarkdown} from "../../../../modules/ca-lexical-editor/src/markdown-transforms";
import {getEditorSettings} from "@/components/editor/settings";
import {EditorWithQuoteComments} from "@/components/editor/editor-with-quote-comments";
import dynamic from "next/dynamic";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {TopicProp, TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {post} from "@/utils/fetch";
const MyLexicalEditor = dynamic( () => import( '../../../../modules/ca-lexical-editor/src/lexical-editor' ), { ssr: false } );


type CreateTopicVersionProps = {
    id: string
    text?: string
    format?: string
    claimsAuthorship?: boolean
    message?: string
    props?: TopicProp[]
}


async function createTopicVersion(body: CreateTopicVersionProps) {
    return await post<CreateTopicVersionProps, {}>(`/topic-version`, body)
}


export const TopicContentExpandedViewWithVersion = ({
    topic,
    pinnedReplies,
    setPinnedReplies,
    wikiEditorState,
    setWikiEditorState,
}: {
    topic: TopicView
    pinnedReplies: string[]
    setPinnedReplies: (v: string[]) => void
    wikiEditorState: WikiEditorState
    setWikiEditorState: (v: WikiEditorState) => void
}) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const feed = useTopicFeed(topic.id)
    const [showingSaveEditPopup, setShowingSaveEditPopup] = useState(false)
    const {mutate} = useSWRConfig()
    const [quoteReplies, setQuoteReplies] = useState<PostView[] | null>(null)

    useEffect(() => {
        // TO DO
        /*if(feed.data){
            const q = feed.feed.replies.filter((r) => {
                return isQuotePost(r.collection) && (r as FastPostProps).content.post.quote != undefined
            }) as FastPostProps[]
            if(!quoteReplies || q.length != quoteReplies.length){
                setQuoteReplies(q)
            }
        }*/
    }, [feed, quoteReplies])

    const editorId = topic.uri +"-"+(quoteReplies ? quoteReplies.map((r) => (r.cid.slice(0, 10))).join("-") : "")

    async function saveEdit(claimsAuthorship: boolean, editMsg: string): Promise<{error?: string}>{
        if(!editor) return {error: "Ocurrió un error con el editor."}

        const s = JSON.stringify(editor.getEditorState())
        const markdown = editorStateToMarkdown(s)

        const {error} = await createTopicVersion(
            {
                id: topic.id,
                text: compress(markdown),
                format: "markdown-compressed",
                claimsAuthorship,
                message: editMsg
            }
        )

        if(error) return {error}

        await mutate("/api/topic/"+topic.id)
        await mutate("/api/topic-history/"+topic.id)
        setShowingSaveEditPopup(false)
        setWikiEditorState("normal")
        return {}
    }
    const saveEnabled = editorState != null // TO DO

    async function onSubmitReply(){
        const topicId = topic.id
        await mutate("/api/topic/"+encodeURIComponent(topicId))
        await mutate("/api/topic-feed/"+encodeURIComponent(topicId))
    }

    return <div className={"w-full"}>
        <TopicContentExpandedViewHeader
            topic={topic}
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
            <div id="editor" className={"pb-2 min-h-[300px] mt-4 px-2"}>
                {["editing", "normal"].includes(wikiEditorState) && <div
                    id={editorId}
                    className={" "+(wikiEditorState == "editing" ? "mb-32" : "mb-8")}
                    key={topic.uri + wikiEditorState + editorId}
                >
                    {wikiEditorState == "editing" && <MyLexicalEditor
                        settings={getEditorSettings({
                            isReadOnly: false,
                            initialText: topic.text,
                            initialTextFormat: topic.format,
                            allowComments: false,
                            tableOfContents: true,
                            showToolbar: true,
                            isDraggableBlock: true,
                            editorClassName: "relative article-content not-article-content mt-8 min-h-[300px]",
                            placeholderClassName: "text-[var(--text-light)] absolute top-0",
                            placeholder: "Agregá información sobre el tema..."
                        })}
                        setEditor={setEditor}
                        setEditorState={setEditorState}
                    />}
                    {wikiEditorState != "editing" && <EditorWithQuoteComments
                        settings={getEditorSettings({
                            isReadOnly: true,
                            initialText: topic.text,
                            initialTextFormat: topic.format,
                            allowComments: true,
                            tableOfContents: true,
                            editorClassName: "relative article-content not-article-content"
                        })}
                        quoteReplies={quoteReplies}
                        pinnedReplies={pinnedReplies}
                        setPinnedReplies={setPinnedReplies}
                        replyTo={{$type: "ar.cabildoabierto.wiki.topicVersion#topicView", ...topic}}
                        onSubmitReply={onSubmitReply}
                        editor={editor}
                        setEditor={setEditor}
                        setEditorState={setEditorState}
                    />}
                </div>}
                {wikiEditorState == "changes" &&
                    <ShowTopicChanges
                        topic={topic}
                    />
                }
                {wikiEditorState == "authors" &&
                    <ShowTopicAuthors
                        topic={topic}
                    />
                }
            </div>
        }

        {showingSaveEditPopup && <SaveEditPopup
            editorState={editorState}
            currentVersion={topic.currentVersion}
            onSave={saveEdit}
            onClose={() => {setShowingSaveEditPopup(false)}}
            topic={topic}
        />}
    </div>
}


export const TopicContentExpandedView = ({
    pinnedReplies,
    setPinnedReplies,
    wikiEditorState,
    setWikiEditorState,
}: {
    pinnedReplies: string[]
    setPinnedReplies: (v: string[]) => void
    wikiEditorState: WikiEditorState
    setWikiEditorState: (v: WikiEditorState) => void
}) => {
    const params = useSearchParams()
    const did: string = params.get("did")
    const rkey: string = params.get("rkey")
    const {data: topic, isLoading} = useTopicVersion(did, rkey)

    if(isLoading){
        return <div className={"mt-8"}>
            <LoadingSpinner/>
        </div>
    }

    return <TopicContentExpandedViewWithVersion
        topic={topic}
        pinnedReplies={pinnedReplies}
        setPinnedReplies={setPinnedReplies}
        wikiEditorState={wikiEditorState}
        setWikiEditorState={setWikiEditorState}
    />
}