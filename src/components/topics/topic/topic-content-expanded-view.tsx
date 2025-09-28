import {Dispatch, SetStateAction, useEffect, useMemo, useRef, useState} from "react";
import {LexicalEditor} from "lexical";
import {TopicContentExpandedViewHeader} from "./topic-content-expanded-view-header";
import {SaveEditPopup} from "./save-edit-popup";
import {compress} from "@/utils/compression";
import {TopicContentHistory} from "./topic-content-history";
import {useTopicVersion, useTopicVersionQuoteReplies} from "@/queries/useTopic";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {useRouter, useSearchParams} from "next/navigation";
import {getEditorSettings} from "@/components/writing/settings";
import {EditorWithQuoteComments} from "@/components/writing/editor-with-quote-comments";
import dynamic from "next/dynamic";
import {post} from "@/utils/fetch";
import {TopicPropsEditor} from "@/components/topics/topic/topic-props-editor";
import {TopicPropsView} from "@/components/topics/topic/props/topic-props-view";
const MyLexicalEditor = dynamic(() => import( '../../../../modules/ca-lexical-editor/src/lexical-editor' ), {ssr: false});
import {ScrollToQuotePost} from "@/components/feed/embed/selection-quote/scroll-to-quote-post";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {contentQueriesFilter} from "@/queries/updates";
import {topicUrl} from "@/utils/uri";
import {ProcessedLexicalState} from "../../../../modules/ca-lexical-editor/src/selection/processed-lexical-state";
import {EmbedContext} from "../../../../modules/ca-lexical-editor/src/nodes/EmbedNode";
import Link from "next/link";
import {WikiEditorState} from "@/lib/types";
import {ArCabildoabiertoWikiTopicVersion, ArCabildoabiertoFeedArticle, ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {editorStateToMarkdown} from "../../../../modules/ca-lexical-editor/src/markdown-transforms";
import {useSession} from "@/queries/useSession";

export type CreateTopicVersionProps = {
    id: string
    text?: string
    format?: string,
    props?: ArCabildoabiertoWikiTopicVersion.TopicProp[]
    message?: string,
    claimsAuthorship?: boolean
    embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
    embedContexts?: EmbedContext[]
}


async function createTopicVersion(body: CreateTopicVersionProps) {
    return await post<CreateTopicVersionProps, {}>(`/topic-version`, body)
}


function emptyTopic(topic: ArCabildoabiertoWikiTopicVersion.TopicView) {
    if (!topic.text || topic.text.trim().length == 0) {
        const embeds = topic.embeds
        return !embeds || embeds.length == 0
    }
    return false
}


const TopicContentExpandedViewContent = ({
                                             wikiEditorState,
    setWikiEditorState,
                                             topic,
                                             quoteReplies,
                                             pinnedReplies,
                                             setPinnedReplies,
                                             editor,
                                             setEditor
                                         }: {
    wikiEditorState: WikiEditorState
    setWikiEditorState: (state: WikiEditorState) => void
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
    quoteReplies: ArCabildoabiertoFeedDefs.PostView[]
    pinnedReplies: string[],
    setPinnedReplies: (v: string[]) => void
    editor: LexicalEditor,
    setEditor: (editor: LexicalEditor) => void
}) => {
    const contentRef = useRef<HTMLDivElement>(null)
    const [isOverflowing, setIsOverflowing] = useState(false)
    const [overlayHovered, setOverlayHovered] = useState(false)

    useEffect(() => {
        if (!contentRef.current) return
        const el = contentRef.current

        const checkOverflow = () => {
            if (wikiEditorState === "minimized") {
                setIsOverflowing(el.scrollHeight > 300)
            } else {
                setIsOverflowing(false)
            }
        }

        checkOverflow()

        const observer = new ResizeObserver(() => {
            checkOverflow()
        })

        observer.observe(el)

        return () => observer.disconnect()
    }, [wikiEditorState, topic])

    const containerClassName = wikiEditorState.startsWith("editing") ? "mb-32" : (wikiEditorState == "minimized" ? "" : "mb-8") +
        (wikiEditorState == "minimized" ? " max-h-[300px] pb-4 overflow-y-clip custom-scrollbar" : "")

    const className = "sm:px-2 px-4 " + (wikiEditorState == "minimized" ? "relative min-h-[100px]" : "pb-2 mt-4 min-h-[300px]")

    return <>
        {["normal", "authors", "changes", "editing", "minimized", "editing-props", "props"].includes(wikiEditorState) &&
            <div
                id="editor"
                className={className}
                key={topic.uri}
            >
                {wikiEditorState == "minimized" && isOverflowing && <div
                    className="w-full border-b border-[var(--accent-dark)] hover:bg-[var(--background-dark-30)] h-[300px] absolute z-[1000] inset-0 cursor-pointer"
                    onClick={() => {if(wikiEditorState == "minimized") setWikiEditorState("normal")}}
                    onMouseEnter={() => {setOverlayHovered(true)}}
                    onMouseLeave={() => {setOverlayHovered(false)}}
                >
                    <div className={"h-full flex flex-col justify-end items-center"}>
                        <div
                            id={"maximize-topic"}
                            className={"py-2 px-4 text-xs uppercase font-light border-l border-r border-t cursor-pointer w-full bg-[var(--background-dark)]" + (overlayHovered ? " bg-[var(--background-dark2)]" : "")}
                        >
                            Ver más
                        </div>
                    </div>
                </div>}
                {["editing", "editing-props", "normal", "minimized", "props"].includes(wikiEditorState) && <div
                    className={containerClassName}
                    ref={contentRef}
                >
                    {wikiEditorState.startsWith("editing") && <MyLexicalEditor
                        settings={getEditorSettings({
                            isReadOnly: false,
                            initialText: topic.text,
                            initialTextFormat: topic.format,
                            embeds: topic.embeds ?? [],
                            allowComments: false,
                            tableOfContents: false,
                            showToolbar: true,
                            isDraggableBlock: true,
                            editorClassName: "relative article-content not-article-content mt-8 min-h-[300px]",
                            placeholderClassName: "text-[var(--text-light)] absolute top-0",
                            placeholder: "Agregá información sobre el tema...",
                            topicMentions: false
                        })}
                        setEditor={setEditor}
                        setEditorState={() => {
                        }}
                    />}
                    {!wikiEditorState.startsWith("editing") && emptyTopic(topic) && topic.currentVersion == topic.uri &&
                        <div className={"text-[var(--text-light)] " + (wikiEditorState == "minimized" ? "pt-4" : "")}>
                            ¡Este tema no tiene contenido! Editalo para crear una primera versión.
                        </div>
                    }
                    {!wikiEditorState.startsWith("editing") && <div>
                        {topic.uri != topic.currentVersion && <div className={"text-sm text-[var(--text-light)]"}>
                            Esta actualmente no es la versión oficial del tema. <Link
                            className={"font-semibold hover:underline"}
                            href={topicUrl(topic.id, undefined, wikiEditorState)}>
                            Ir a la versión actual</Link>.
                        </div>}
                        <EditorWithQuoteComments
                            uri={topic.uri}
                            cid={topic.cid}
                            settings={getEditorSettings({
                                isReadOnly: true,
                                initialText: topic.text,
                                initialTextFormat: topic.format,
                                embeds: topic.embeds ?? [],
                                allowComments: true,
                                tableOfContents: wikiEditorState != "minimized",
                                editorClassName: "relative article-content not-article-content " + (wikiEditorState == "minimized" ? "no-margin-first pt-2" : ""),
                                shouldPreserveNewLines: true,
                                markdownShortcuts: false,
                                topicMentions: false
                            })}
                            clippedToHeight={wikiEditorState == "minimized" ? 300 : null}
                            quoteReplies={quoteReplies}
                            pinnedReplies={pinnedReplies}
                            setPinnedReplies={setPinnedReplies}
                            replyTo={{$type: "ar.cabildoabierto.wiki.topicVersion#topicView", ...topic}}
                            editor={editor}
                            setEditor={setEditor}
                            setEditorState={() => {
                            }}
                        />
                    </div>}
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
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
    pinnedReplies: string[]
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
    wikiEditorState: WikiEditorState
    setWikiEditorState: (v: WikiEditorState) => void
}) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [topicProps, setTopicProps] = useState<ArCabildoabiertoWikiTopicVersion.TopicProp[]>(Array.from(topic.props) ?? [])
    const {data: quoteReplies} = useTopicVersionQuoteReplies(topic.uri)
    const [showingSaveEditPopup, setShowingSaveEditPopup] = useState(false)
    const qc = useQueryClient()
    const {user} = useSession()

    const saveEditMutation = useMutation({
        mutationFn: createTopicVersion,
        onMutate: () => {
            qc.cancelQueries(contentQueriesFilter(topic.uri))
        },
        onSettled: () => {
            qc.removeQueries(contentQueriesFilter(topic.uri))
        }
    })

    async function saveEdit(claimsAuthorship: boolean, editMsg: string): Promise<{ error?: string }> {
        if (editor) {
            const editorState = new ProcessedLexicalState(editor.getEditorState().toJSON())
            const {
                markdown,
                embeds,
                embedContexts
            } = editorStateToMarkdown(editorState)

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
        qc.invalidateQueries({queryKey: ["session"]})
        return {}
    }

    const saveEnabled = true

    const content = useMemo(() => {
        return <TopicContentExpandedViewContent
            editor={editor}
            setWikiEditorState={setWikiEditorState}
            setEditor={setEditor}
            topic={topic}
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
            quoteReplies={quoteReplies}
            wikiEditorState={wikiEditorState}
        />
    }, [editor, setEditor, topic, pinnedReplies, setPinnedReplies, quoteReplies, wikiEditorState])

    return <ScrollToQuotePost setPinnedReplies={setPinnedReplies}>
        <div id="topic-content" className={"w-full " + (wikiEditorState == "minimized" ? "" : "") }>
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

            {content}

            {showingSaveEditPopup && user && <SaveEditPopup
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