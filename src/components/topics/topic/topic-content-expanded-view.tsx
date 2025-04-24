import {TopicProps} from "@/lib/types";
import {useEffect, useState} from "react";
import {useSWRConfig} from "swr";
import {EditorState, LexicalEditor} from "lexical";
import {TopicContentExpandedViewHeader, WikiEditorState} from "./topic-content-expanded-view-header";
import {topicVersionPropsToReplyToContent} from "./topic-content";
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
import {ErrorPage} from "../../../../modules/ui-utils/src/error-page";
import {editorStateToMarkdown} from "../../../../modules/ca-lexical-editor/src/markdown-transforms";
import {getEditorSettings} from "@/components/editor/settings";
import {EditorWithQuoteComments} from "@/components/editor/editor-with-quote-comments";
import dynamic from "next/dynamic";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
const MyLexicalEditor = dynamic( () => import( '../../../../modules/ca-lexical-editor/src/lexical-editor' ), { ssr: false } );


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

type CreateTopicVersionProps = {
    id: string
    text: FormData
    format: string
    claimsAuthorship: boolean
    message: string
}

async function createTopicVersion({id, text, format, claimsAuthorship, message}: CreateTopicVersionProps){
    return {error: "Sin implementar"}
}


export const TopicContentExpandedViewWithVersion = ({
    topic,
    topicVersion,
    pinnedReplies,
    setPinnedReplies,
    wikiEditorState,
    setWikiEditorState,
}: {
    topicVersion?: SmallTopicVersionProps
    topic: TopicProps
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

    const editorId = !topicVersion ? "" : topicVersion.uri +"-"+(quoteReplies ? quoteReplies.map((r) => (r.cid.slice(0, 10))).join("-") : "")

    async function saveEdit(claimsAuthorship: boolean, editMsg: string): Promise<{error?: string}>{
        if(!editor) return {error: "Ocurrió un error con el editor."}

        const s = JSON.stringify(editor.getEditorState())
        const markdown = editorStateToMarkdown(s)

        const formData = new FormData()
        formData.set("data", new File([compress(markdown)], ""))

        const result = await createTopicVersion(
            {
                id: topic.id,
                text: formData,
                format: "markdown-compressed",
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
    }
    const saveEnabled = editorState && topicVersion && JSON.stringify(editorState) != topicVersion.content.text

    async function onSubmitReply(){
        const topicId = topic.id
        await mutate("/api/topic/"+encodeURIComponent(topicId))
        await mutate("/api/topic-feed/"+encodeURIComponent(topicId))
    }

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
            <div id="editor" className={"pb-2 min-h-[300px] mt-2 px-2"}>
                {["editing", "normal"].includes(wikiEditorState) && (topicVersion ? <div
                    id={editorId}
                    className={" "+(wikiEditorState == "editing" ? "mb-32" : "mb-8")}
                    key={topicVersion.uri + wikiEditorState + editorId}
                >
                    {wikiEditorState == "editing" && <MyLexicalEditor
                        settings={getEditorSettings({
                            isReadOnly: false,
                            initialText: topicVersion.content.text,
                            initialTextFormat: topicVersion.content.format,
                            allowComments: false,
                            tableOfContents: true
                        })}
                        setEditor={setEditor}
                        setEditorState={setEditorState}
                    />}
                    {wikiEditorState != "editing" && <EditorWithQuoteComments
                        settings={getEditorSettings({
                            isReadOnly: true,
                            initialText: topicVersion.content.text,
                            initialTextFormat: topicVersion.content.format,
                            allowComments: true,
                            tableOfContents: true,
                            editorClassName: "article-content not-article-content"
                        })}
                        quoteReplies={quoteReplies}
                        pinnedReplies={pinnedReplies}
                        setPinnedReplies={setPinnedReplies}
                        replyTo={topicVersionPropsToReplyToContent(topicVersion, topic.id)}
                        onSubmitReply={onSubmitReply}
                        editor={editor}
                        setEditor={setEditor}
                        setEditorState={setEditorState}
                    />}
                </div> :
                    <div className={"text-[var(--text-light)] text-center py-8"}>
                        No hay una versión aceptada de este tema.
                    </div>)
                }
                {wikiEditorState == "changes" &&
                    (topicVersion ? <ShowTopicChanges
                        topic={topic}
                        topicVersion={topicVersion}
                    /> : <div className={"py-8 text-[var(--text-light)] text-center"}>No se pueden mostrar los cambios.</div>)
                }
                {wikiEditorState == "authors" &&
                    (topicVersion ? <ShowTopicAuthors
                        topic={topic}
                        topicVersion={topicVersion}
                    /> : <div className={"py-8 text-[var(--text-light)] text-center"}>No se pueden mostrar los autores.</div>)
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
        return <div className={"py-8"}>
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