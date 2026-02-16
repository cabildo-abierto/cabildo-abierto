import React, {useMemo, useState} from "react"
import {BaseFullscreenPopup} from "../../utils/dialogs/base-fullscreen-popup"
import {
    ArCabildoabiertoFeedDefs,
    ArCabildoabiertoEmbedRecord, CreatePostProps, ImagePayload, ArCabildoabiertoEmbedVisualization,
    CreatePostThreadElement,
    ArCabildoabiertoWikiTopicVersion
} from "@cabildo-abierto/api"
import {ReplyToContent} from "./write-panel";
import {MarkdownSelection} from "@/components/editor/selection/markdown-selection";
import {LexicalSelection} from "@/components/editor/selection/lexical-selection";
import {EditorState} from "lexical";
import {getPlainText} from "@cabildo-abierto/editor-core";
import {useIsMobile} from "@/components/utils/use-is-mobile";
import {cn} from "@/lib/utils";
import {WritePanelTopbar} from "@/components/writing/write-panel/write-panel-topbar";
import {WritePost} from "@/components/writing/write-panel/write-post";
import {UnselectedThreadElement} from "@/components/writing/write-panel/unselected-thread-element";
import {$Typed, AppBskyEmbedExternal, AppBskyEmbedImages, AppBskyFeedPost} from "@atproto/api";
import {markdownToEditorState} from "@/components/editor/markdown-transforms";
import {FastPostReplyProps} from "@/lib/types";
import {hasEnDiscusionLabel} from "@/components/feed/utils/post-preview-frame";
import {visualizationViewToMain} from "@/components/visualizations/visualization/utils";
import {getTextLength} from "@/components/writing/write-panel/rich-text";
import {ConfirmEditPopup} from "@/components/writing/write-panel/confirm-edit-popup";
import {CloseButton} from "@/components/utils/base/close-button";
import {useRouter} from "next/navigation";
import {CreateTopic} from "@/components/writing/write-panel/create-topic";
import {BackButton} from "@/components/utils/base/back-button";
import {Paragraph} from "@/components/utils/base/paragraph";


const emptyThreadElementState = (editorKey: number): ThreadElementState => ({
    text: "",
    images: [],
    editorState: null,
    externalEmbed: null,
    visualization: null,
    editorKey
})


type ThreadElementExternalState = {
    url: string
    view: $Typed<AppBskyEmbedExternal.View>
}


export type ThreadElementState = {
    text: string
    editorState: EditorState | null
    images: ImagePayload[]
    externalEmbed: ThreadElementExternalState | null
    visualization: ArCabildoabiertoEmbedVisualization.Main | null
    editorKey: number
}


type WritePanelProps = {
    replyTo?: ReplyToContent
    open: boolean
    onClose: () => void
    selection?: MarkdownSelection | LexicalSelection
    quotedPost?: ArCabildoabiertoEmbedRecord.View["record"]
    handleSubmit: (_: CreatePostProps) => Promise<{ error?: string }>
    postView?: ArCabildoabiertoFeedDefs.PostView
    isVoteReject?: boolean
    className?: string
}


function emptyEditorState(editorState: EditorState | null) {
    return editorState == null || getPlainText(editorState.toJSON().root).trim().length == 0
}

export function isThreadElementStateEmpty(threadElementState: ThreadElementState) {
    return (!threadElementState.text || threadElementState.text.length == 0) && threadElementState.images.length == 0 && emptyEditorState(threadElementState.editorState) && threadElementState.externalEmbed?.url == null && threadElementState.visualization == null
}


function useInitialThreadElementState(editorKey: number, postView?: ArCabildoabiertoFeedDefs.PostView): ThreadElementState {

    return useMemo(() => {
        if (!postView) {
            return emptyThreadElementState(editorKey)
        } else {
            let images: ImagePayload[] = []
            if (postView && AppBskyEmbedImages.isView(postView.embed)) {
                images = postView.embed.images.map(i => ({
                    $type: "url",
                    src: i.thumb,
                    editorState: null
                }))
            }
            let externalEmbed: ThreadElementExternalState | null = AppBskyEmbedExternal.isView(postView.embed) ? {
                view: postView.embed,
                url: postView.embed.external.uri
            } : null

            let visualization: ArCabildoabiertoEmbedVisualization.Main | null = null
            if (ArCabildoabiertoEmbedVisualization.isView(postView.embed)) {
                visualization = visualizationViewToMain(postView.embed)
            }

            return {
                text: "",
                images,
                editorState: null,
                externalEmbed,
                visualization,
                editorKey
            }
        }
    }, [postView])
}


function useEnDiscusionForWritePost(replyTo: ReplyToContent, postView?: ArCabildoabiertoFeedDefs.PostView) {
    const initialState = postView ? hasEnDiscusionLabel(postView) : !replyTo
    const [enDiscusion, setEnDiscusion] = useState(initialState)

    return {enDiscusion, setEnDiscusion}
}


function replyFromParentElement(replyTo: ReplyToContent): FastPostReplyProps {
    if (ArCabildoabiertoFeedDefs.isPostView(replyTo)) {
        const parent = {
            uri: replyTo.uri,
            cid: replyTo.cid
        }
        if ((replyTo.record as AppBskyFeedPost.Record).reply) {
            return {
                parent,
                root: (replyTo.record as AppBskyFeedPost.Record).reply.root
            }
        } else {
            return {
                parent,
                root: {...parent}
            }
        }
    } else {
        const parent = {
            uri: replyTo.uri,
            cid: replyTo.cid
        }
        return {
            parent,
            root: parent
        }
    }
}


function validThreadElement(e: ThreadElementState): boolean {
    let textLength = 0
    try {
        textLength = getTextLength(e.text)
    } catch {
    }

    return (textLength > 0 && textLength <= 300) || (e.images && e.images.length > 0) || e.visualization != null
}


const WritePanelPanel = ({
                             replyTo,
                             open,
                             onClose,
                             selection,
                             quotedPost,
                             handleSubmit,
                             postView,
                             isVoteReject = false,
                             className
                         }: WritePanelProps) => {
    const [selected, setSelected] = useState<string | null>(replyTo || quotedPost || postView || selection ? "Publicación" : null)
    const [hidden, setHidden] = useState(false)
    const {isMobile} = useIsMobile()
    const [nextEditorKey, setNextEditorKey] = useState(1)
    const initialThreadElementState = useInitialThreadElementState(0, postView)
    const [thread, setThread] = useState<ThreadElementState[]>([initialThreadElementState])
    const [selectedThreadIndex, setSelectedThreadIndex] = useState(0)
    const {enDiscusion, setEnDiscusion} = useEnDiscusionForWritePost(replyTo, postView)
    const [forceEditModalOpen, setForceEditModalOpen] = useState(false)
    const router = useRouter()

    function onDelete(i: number) {
        if (i == thread.length - 1) {
            setSelectedThreadIndex(i - 1)
        }
        setThread(thread.filter((_, j) => j != i))
    }

    const valid = useMemo(() => {
        return thread.every(e => validThreadElement(e))
    }, [thread])


    async function handleClickSubmit(force: boolean = false) {
        const reply = replyTo ? replyFromParentElement(replyTo) : undefined

        const threadElements: CreatePostThreadElement[] = thread.map((e, i) => {
            const quotedPostForPostCreation = i == 0 && quotedPost && "uri" in quotedPost && "cid" in quotedPost ? {
                uri: quotedPost.uri,
                cid: quotedPost.cid
            } : undefined

            const text = getPlainText(e.editorState.toJSON().root).trim()

            let selectionForPost: [number, number]
            if (i == 0 && (selection instanceof LexicalSelection && (ArCabildoabiertoWikiTopicVersion.isTopicView(replyTo) || ArCabildoabiertoFeedDefs.isFullArticleView(replyTo)) && replyTo.format == "markdown")) {
                const state = markdownToEditorState(
                    replyTo.text,
                    true,
                    true,
                    replyTo.embeds
                )
                selectionForPost = selection.toMarkdownSelection(state).toArray()
            }

            return {
                text,
                images: e.images,
                externalEmbedView: e.externalEmbed?.view,
                visualization: e.visualization ?? undefined,
                quotedPost: quotedPostForPostCreation,
                uri: i == 0 ? postView?.uri : undefined,
                selection: selectionForPost
            }
        })

        const post: CreatePostProps = {
            reply,
            forceEdit: force,
            threadElements,
            enDiscusion
        }

        const {error} = await handleSubmit(post)
        if (error) {
            console.log("error", error)
            if (error.includes("La publicación ya fue referenciada")) {
                setForceEditModalOpen(true)
                return {}
            } else {
                return {error}
            }
        }
        setThread([initialThreadElementState])
        onClose()
        return {}
    }

    return (
        <BaseFullscreenPopup
            hidden={hidden}
            open={open}
            className={cn("w-full max-w-[512px] h-auto sm:w-full bg-transparent", className)}
            backgroundShadow={replyTo == null && quotedPost == null && postView == null}
            overlayClassName={"z-[1399]"}
            fullscreenOnMobile={false}
        >
            {selected == "Publicación" && <div
                className={cn("w-full group portal bg-[var(--background-dark)] pt-1 flex flex-col max-h-[80vh] overflow-y-auto custom-scrollbar", !isMobile ? "" : "mt-8")}
            >
                <WritePanelTopbar
                    onClose={onClose}
                    onBack={() => {
                        setSelected(null)
                    }}
                    replyTo={replyTo}
                    valid={valid}
                    isVoteReject={isVoteReject}
                    editing={postView != null}
                    handleClickSubmit={handleClickSubmit}
                />
                {isVoteReject && <Paragraph className={"text-xs p-2"}>
                    Se va a agregar un voto de rechazo a esta versión y una publicación en la discusión del tema con tu
                    justificación.
                </Paragraph>}
                <div className={""}>
                    {thread.map((e, i) => {
                        if (i == selectedThreadIndex) {
                            return <WritePost
                                replyTo={replyTo}
                                selection={selection}
                                quotedContent={quotedPost}
                                setHidden={setHidden}
                                handleClickSubmit={handleClickSubmit}
                                postView={postView}
                                threadElementState={thread[selectedThreadIndex]}
                                setThreadElementState={(updater) => {
                                    setThread(prev =>
                                        prev.map((e, i) =>
                                            i === selectedThreadIndex ? updater(e) : e
                                        )
                                    )
                                }}
                                enDiscusion={enDiscusion}
                                setEnDiscusion={setEnDiscusion}
                                onAddThreadElement={() => {
                                    setThread([
                                        ...thread.slice(0, selectedThreadIndex + 1),
                                        emptyThreadElementState(nextEditorKey),
                                        ...thread.slice(selectedThreadIndex + 1)
                                    ])
                                    setNextEditorKey(nextEditorKey + 1)
                                    setSelectedThreadIndex(selectedThreadIndex + 1)
                                }}
                                key={i}
                                isVoteReject={isVoteReject}
                                onDelete={() => {
                                    onDelete(i)
                                }}
                                isOnlyElement={thread.length == 1}
                                editorKey={e.editorKey}
                            />
                        } else {
                            return <UnselectedThreadElement
                                key={i}
                                threadElementState={e}
                                onSelect={() => {
                                    setSelectedThreadIndex(i)
                                }}
                            />
                        }
                    })}
                    {forceEditModalOpen && <ConfirmEditPopup
                        handleClickSubmit={handleClickSubmit}
                        setForceEditModalOpen={setForceEditModalOpen}
                    />}
                </div>
            </div>}
            {selected == null && <div className={"flex relative portal group h-[300px] bg-[var(--background-dark)]"}>
                <div className={"absolute top-1 right-1"}>
                    <CloseButton onClose={onClose} size={"small"}/>
                </div>
                <div className={"flex w-full"}>
                    <div
                        onClick={() => {
                            setSelected("Publicación")
                        }}
                        className={"flex-1 border-r hover:bg-[var(--background-dark2)] cursor-pointer font-light text-center items-center h-full flex justify-center"}>
                        Publicación
                    </div>
                    <div
                        onClick={() => {
                            router.push("/escribir/articulo");
                            onClose()
                        }}
                        className={"flex-1 border-r hover:bg-[var(--background-dark2)] cursor-pointer font-light text-center items-center h-full flex justify-center"}>
                        Artículo
                    </div>
                    <div
                        onClick={() => {
                            setSelected("Tema")
                        }}
                        className={"flex-1 hover:bg-[var(--background-dark2)] cursor-pointer font-light text-center items-center h-full flex justify-center"}>
                        Tema
                    </div>
                </div>
            </div>}
            {selected == "Tema" && <div className={"relative bg-[var(--background-dark)] group portal "}>
                <div className={"absolute top-0 left-0 w-full flex justify-between items-center px-1 py-1"}>
                    <BackButton
                        onClick={() => {
                            setSelected(null)
                        }}
                        size={"default"}
                    />
                    <CloseButton
                        onClose={onClose}
                        size={"small"}
                    />
                </div>
                <CreateTopic onClose={onClose} onMenu={true}/>
            </div>}
        </BaseFullscreenPopup>
    )
};


export default WritePanelPanel;
