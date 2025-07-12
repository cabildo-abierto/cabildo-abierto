import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {LexicalEditor} from "lexical";
import {TopicContentExpandedViewHeader, WikiEditorState} from "./topic-content-expanded-view-header";
import {SaveEditPopup} from "./save-edit-popup";
import {compress} from "@/utils/compression";
import {TopicContentHistory} from "./topic-content-history";
import {useTopicFeed, useTopicVersion} from "@/queries/api";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {useRouter, useSearchParams} from "next/navigation";
import {
    editorStateToMarkdown
} from "../../../../modules/ca-lexical-editor/src/markdown-transforms";
import {getEditorSettings} from "@/components/editor/settings";
import {EditorWithQuoteComments, refreshEditor} from "@/components/editor/editor-with-quote-comments";
import dynamic from "next/dynamic";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {TopicProp, TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {post} from "@/utils/fetch";
import {TopicPropsEditor} from "@/components/topics/topic/topic-props-editor";
import {TopicPropsView} from "@/components/topics/topic/props/topic-props-view";
import {isPostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";

const MyLexicalEditor = dynamic(() => import( '../../../../modules/ca-lexical-editor/src/lexical-editor' ), {ssr: false});
import {isView as isSelectionQuoteEmbed} from "@/lex-api/types/ar/cabildoabierto/embed/selectionQuote";
import {ScrollToQuotePost} from "@/components/feed/embed/selection-quote/scroll-to-quote-post";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {contentQueriesFilter} from "@/queries/updates";
import {areSetsEqual} from "@/utils/arrays";
import {ArticleEmbedView} from "@/lex-api/types/ar/cabildoabierto/feed/article";
import {topicUrl} from "@/utils/uri";
import {ProcessedLexicalState} from "../../../../modules/ca-lexical-editor/src/selection/processed-lexical-state";
import {EmbedContext} from "../../../../modules/ca-lexical-editor/src/nodes/EmbedNode";

export type CreateTopicVersionProps = {
    id: string
    text?: string
    format?: string,
    props?: TopicProp[]
    message?: string,
    claimsAuthorship?: boolean
    embeds?: ArticleEmbedView[]
    embedContexts?: EmbedContext[]
}


async function createTopicVersion(body: CreateTopicVersionProps) {
    return await post<CreateTopicVersionProps, {}>(`/topic-version`, body)
}


function emptyTopic(topic: TopicView) {
    if (!topic.text || topic.text.trim().length == 0) {
        const embeds = topic.embeds
        return !embeds || embeds.length == 0
    }
    return false
}


const TopicContentExpandedViewContent = ({
     wikiEditorState,
     topic,
     quoteReplies,
     pinnedReplies,
     setPinnedReplies,
     editor,
     setEditor
}: {
    wikiEditorState: WikiEditorState
    topic: TopicView
    quoteReplies: PostView[]
    pinnedReplies: string[],
    setPinnedReplies: (v: string[]) => void
    editor: LexicalEditor,
    setEditor: (editor: LexicalEditor) => void
}) => {
    const [hasRefreshed, setHasRefreshed] = useState(false)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if(wikiEditorState.startsWith("editing")){
                if (editor) {
                    refreshEditor(editor)
                    setHasRefreshed(true);
                }
            }
        }, 200);

        return () => clearTimeout(timeoutId);
    }, [editor, hasRefreshed])

    return <>
        {["normal", "authors", "changes", "editing", "editing-props", "props"].includes(wikiEditorState) &&
            <div id="editor" className={"pb-2 min-h-[300px] mt-4 sm:px-2 px-4"} key={topic.uri}>
                {["editing", "editing-props", "normal", "props"].includes(wikiEditorState) && <div
                    className={wikiEditorState.startsWith("editing") ? "mb-32" : "mb-8"}
                >
                    {wikiEditorState.startsWith("editing") && <MyLexicalEditor
                        settings={getEditorSettings({
                            isReadOnly: false,
                            initialText: topic.text,
                            initialTextFormat: topic.format,
                            embeds: topic.embeds ?? [],
                            allowComments: false,
                            tableOfContents: true,
                            showToolbar: true,
                            isDraggableBlock: true,
                            editorClassName: "relative article-content not-article-content mt-8 min-h-[300px]",
                            placeholderClassName: "text-[var(--text-light)] absolute top-0",
                            placeholder: "Agregá información sobre el tema..."
                        })}
                        setEditor={setEditor}
                        setEditorState={() => {
                        }}
                    />}
                    {!wikiEditorState.startsWith("editing") && emptyTopic(topic) &&
                        <div className={"text-[var(--text-light)]"}>
                            ¡Este tema no tiene contenido! Editalo para crear una primera versión.
                        </div>
                    }
                    {!wikiEditorState.startsWith("editing") && <EditorWithQuoteComments
                        uri={topic.uri}
                        settings={getEditorSettings({
                            isReadOnly: true,
                            initialText: topic.text,
                            initialTextFormat: topic.format,
                            embeds: topic.embeds ?? [],
                            allowComments: true,
                            tableOfContents: true,
                            editorClassName: "relative article-content not-article-content"
                        })}
                        quoteReplies={quoteReplies}
                        pinnedReplies={pinnedReplies}
                        setPinnedReplies={setPinnedReplies}
                        replyTo={{$type: "ar.cabildoabierto.wiki.topicVersion#topicView", ...topic}}
                        editor={editor}
                        setEditor={setEditor}
                        setEditorState={() => {
                        }}
                    />}
                </div>}
            </div>
        }
    </>
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
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
    wikiEditorState: WikiEditorState
    setWikiEditorState: (v: WikiEditorState) => void
}) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [topicProps, setTopicProps] = useState<TopicProp[]>(Array.from(topic.props) ?? [])
    const feed = useTopicFeed(topic.id)
    const [showingSaveEditPopup, setShowingSaveEditPopup] = useState(false)
    const [quoteReplies, setQuoteReplies] = useState<PostView[] | null>(null)
    const qc = useQueryClient()

    const saveEditMutation = useMutation({
        mutationFn: createTopicVersion,
        onMutate: (topicVersion) => {
            qc.cancelQueries(contentQueriesFilter(topic.uri))
        },
        onSettled: (data, variables, context) => {
            qc.removeQueries(contentQueriesFilter(topic.uri))
        }
    })

    useEffect(() => {
        if (feed.data) {
            const q: PostView[] = feed.data.replies.map(c => c.content)
                .filter(c => isPostView(c)).filter(c => isSelectionQuoteEmbed(c.embed))
            if (!quoteReplies || !areSetsEqual(new Set(q.map(x => x.uri)), new Set(quoteReplies.map(x => x.uri)))) {
                setQuoteReplies(q)
            }
        }
    }, [feed, quoteReplies])


    async function saveEdit(claimsAuthorship: boolean, editMsg: string): Promise<{ error?: string }> {
        if(editor){
            const {
                markdown,
                embeds,
                embedContexts
            } = editorStateToMarkdown(new ProcessedLexicalState(editor.getEditorState().toJSON()))

            const {error} = await saveEditMutation.mutateAsync({
                id: topic.id,
                text: compress(markdown),
                format: "markdown-compressed",
                claimsAuthorship,
                message: editMsg,
                props: topicProps,
                embeds,
                embedContexts
            })
            if (error) return {error}
        } else {

            const {error} = await saveEditMutation.mutateAsync({
                id: topic.id,
                text: topic.text,
                format: topic.format,
                claimsAuthorship,
                message: editMsg,
                props: topicProps,
                embeds: topic.embeds
            })
            if (error) return {error}

        }

        setShowingSaveEditPopup(false)
        setWikiEditorState("normal")
        return {}
    }

    const saveEnabled = true

    return <ScrollToQuotePost setPinnedReplies={setPinnedReplies}>
        <div className={"w-full"}>
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

            {wikiEditorState == "editing-props" && <TopicPropsEditor
                props={topicProps}
                setProps={setTopicProps}
                topic={topic}
                onClose={() => {
                    setWikiEditorState("editing")
                }}
            />}

            {wikiEditorState == "props" && <TopicPropsView topic={topic}/>}

            {wikiEditorState != "editing-props" && <TopicContentExpandedViewContent
                editor={editor}
                setEditor={setEditor}
                topic={topic}
                pinnedReplies={pinnedReplies}
                setPinnedReplies={setPinnedReplies}
                quoteReplies={quoteReplies}
                wikiEditorState={wikiEditorState}
            />}

            {showingSaveEditPopup && <SaveEditPopup
                open={showingSaveEditPopup}
                editor={editor}
                onSave={saveEdit}
                onClose={() => {
                    setShowingSaveEditPopup(false)
                }}
                topic={topic}
            />}
        </div>
    </ScrollToQuotePost>
}


export const TopicContentExpandedView = ({
                                             pinnedReplies,
                                             setPinnedReplies,
                                             wikiEditorState,
                                             setWikiEditorState,
                                             topicId
                                         }: {
    topicId: string
    pinnedReplies: string[]
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
    wikiEditorState: WikiEditorState
    setWikiEditorState: (v: WikiEditorState) => void
}) => {
    const params = useSearchParams()
    const did: string = params.get("did")
    const rkey: string = params.get("rkey")
    const {data: topic, error, isLoading} = useTopicVersion(did, rkey)
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && (!topic || error)) {
            router.push(topicUrl(topicId, undefined, wikiEditorState))
        }
    }, [isLoading, error, topic])

    if (isLoading) {
        return <div className={"mt-8"}>
            <LoadingSpinner/>
        </div>
    } else if (!topic || error) {

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