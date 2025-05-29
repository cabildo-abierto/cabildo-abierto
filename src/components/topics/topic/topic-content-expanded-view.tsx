import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {EditorState, LexicalEditor} from "lexical";
import {TopicContentExpandedViewHeader, WikiEditorState} from "./topic-content-expanded-view-header";
import {SaveEditPopup} from "./save-edit-popup";
import {compress} from "@/utils/compression";
import {TopicContentHistory} from "./topic-content-history";
import {ShowTopicChanges} from "./show-topic-changes";
import {ShowTopicAuthors} from "./show-topic-authors";
import {useTopicFeed, useTopicVersion} from "@/queries/api";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {useSearchParams} from "next/navigation";
import {
    editorStateToMarkdown
} from "../../../../modules/ca-lexical-editor/src/markdown-transforms";
import {getEditorSettings} from "@/components/editor/settings";
import {EditorWithQuoteComments} from "@/components/editor/editor-with-quote-comments";
import dynamic from "next/dynamic";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {TopicProp, TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {post} from "@/utils/fetch";
import {TopicPropsEditor} from "@/components/topics/topic/topic-props-editor";
import {ErrorPage} from "../../../../modules/ui-utils/src/error-page";
import {TopicPropsView} from "@/components/topics/topic/props/topic-props-view";
import {isPostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";

const MyLexicalEditor = dynamic(() => import( '../../../../modules/ca-lexical-editor/src/lexical-editor' ), {ssr: false});
import {isView as isSelectionQuoteEmbed} from "@/lex-api/types/ar/cabildoabierto/embed/selectionQuote";
import {ScrollToQuotePost} from "@/components/feed/embed/selection-quote/scroll-to-quote-post";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {contentQueriesFilter} from "@/queries/updates";
import {areSetsEqual} from "@/utils/arrays";
import {ArticleEmbed} from "@/lex-api/types/ar/cabildoabierto/feed/article";
import {Record as TopicVersionRecord} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";

export type CreateTopicVersionProps = {
    id: string
    text?: string
    format?: string,
    props?: TopicProp[]
    message?: string,
    claimsAuthorship?: boolean
    embeds?: ArticleEmbed[]
}


async function createTopicVersion(body: CreateTopicVersionProps) {
    return await post<CreateTopicVersionProps, {}>(`/topic-version`, body)
}


function emptyTopic(topic: TopicView) {
    if(!topic.text || topic.text.trim().length == 0){
        const embeds = (topic.record as TopicVersionRecord).embeds
        return !embeds || embeds.length == 0
    }
    return false
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
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const [topicProps, setTopicProps] = useState<TopicProp[]>(topic.props ?? [])
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
            // TO DO: Actualización optimista con el contenido del tema
        }
    })

    useEffect(() => {
        // TO DO
        if (feed.data) {
            const q: PostView[] = feed.data.replies.map(c => c.content)
                .filter(c => isPostView(c)).filter(c => isSelectionQuoteEmbed(c.embed))
            if (!quoteReplies || !areSetsEqual(new Set(q.map(x => x.uri)), new Set(quoteReplies.map(x => x.uri)))) {
                setQuoteReplies(q)
            }
        }
    }, [feed, quoteReplies])

    async function saveEdit(claimsAuthorship: boolean, editMsg: string): Promise<{ error?: string }> {
        if (!editor) return {error: "Ocurrió un error con el editor."}

        const s = JSON.stringify(editor.getEditorState().toJSON())
        const {markdown, embeds} = editorStateToMarkdown(s)

        await saveEditMutation.mutateAsync({
            id: topic.id,
            text: compress(markdown),
            format: "markdown-compressed",
            claimsAuthorship,
            message: editMsg,
            props: topicProps,
            embeds
        })

        setShowingSaveEditPopup(false)
        setWikiEditorState("normal")
        return {}
    }

    const saveEnabled = editorState != null // TO DO

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

            {wikiEditorState == "editing-props" &&
            <TopicPropsEditor props={topicProps} setProps={setTopicProps} topic={topic} onClose={() => {
                setWikiEditorState("editing")
            }}/>}

            {wikiEditorState == "props" && <TopicPropsView topic={topic}/>}

            {["normal", "authors", "changes", "editing", "editing-props", "props"].includes(wikiEditorState) &&
                <div id="editor" className={"pb-2 min-h-[300px] mt-4 px-2"} key={topic.uri}>
                    {["editing", "editing-props", "normal", "props"].includes(wikiEditorState) && <div
                        className={" " + (wikiEditorState.startsWith("editing") ? "mb-32" : "mb-8")}
                    >
                        {wikiEditorState.startsWith("editing") && <MyLexicalEditor
                            settings={getEditorSettings({
                                isReadOnly: false,
                                initialText: topic.text,
                                initialTextFormat: topic.format,
                                embeds: (topic.record as TopicVersionRecord).embeds,
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
                        {!wikiEditorState.startsWith("editing") && emptyTopic(topic) &&
                        <div className={"text-[var(--text-light)]"}>
                            ¡Este tema no tiene contenido! Editalo para crear una primera versión.
                        </div>}

                        {!wikiEditorState.startsWith("editing") && <EditorWithQuoteComments
                            settings={getEditorSettings({
                                isReadOnly: true,
                                initialText: topic.text,
                                initialTextFormat: topic.format,
                                embeds: (topic.record as TopicVersionRecord).embeds,
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

            {editorState && <SaveEditPopup
                open={showingSaveEditPopup}
                editorState={editorState}
                currentVersion={topic.currentVersion}
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
                                         }: {
    pinnedReplies: string[]
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
    wikiEditorState: WikiEditorState
    setWikiEditorState: (v: WikiEditorState) => void
}) => {
    const params = useSearchParams()
    const did: string = params.get("did")
    const rkey: string = params.get("rkey")
    const {data: topic, error, isLoading} = useTopicVersion(did, rkey)

    if (isLoading) {
        return <div className={"mt-8"}>
            <LoadingSpinner/>
        </div>
    } else if (!topic || error) {
        return <ErrorPage>
            {error?.message}
        </ErrorPage>
    }

    return <TopicContentExpandedViewWithVersion
        topic={topic}
        pinnedReplies={pinnedReplies}
        setPinnedReplies={setPinnedReplies}
        wikiEditorState={wikiEditorState}
        setWikiEditorState={setWikiEditorState}
    />
}