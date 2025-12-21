import React, {useMemo, useState} from "react";
import {EditorState} from "lexical";
import {
    ArCabildoabiertoEmbedRecord,
    ArCabildoabiertoEmbedVisualization,
    ArCabildoabiertoFeedDefs,
    ArCabildoabiertoWikiTopicVersion, CreatePostProps, CreatePostThreadElement,
    ImagePayload
} from "@cabildo-abierto/api";
import {hasEnDiscusionLabel} from "@/components/feed/utils/post-preview-frame";
import {ReplyToContent} from "@/components/writing/write-panel/write-panel";
import {$Typed, AppBskyEmbedExternal, AppBskyEmbedImages, AppBskyFeedPost} from "@atproto/api";
import {WritePost} from "@/components/writing/write-panel/write-post";
import {MarkdownSelection} from "@/components/editor/selection/markdown-selection";
import {LexicalSelection} from "@/components/editor/selection/lexical-selection";
import {UnselectedThreadElement} from "@/components/writing/write-panel/unselected-thread-element";
import {FastPostReplyProps} from "@/lib/types";
import {markdownToEditorState} from "@/components/editor/markdown-transforms";
import {getPlainText} from "@cabildo-abierto/editor-core";
import {BaseFullscreenPopup} from "@/components/utils/dialogs/base-fullscreen-popup";
import {BaseButton} from "@/components/utils/base/base-button";
import {StateButton} from "@/components/utils/base/state-button";
import {visualizationViewToMain} from "@/components/visualizations/visualization/utils";


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
    visualization: ArCabildoabiertoEmbedVisualization.View | null
    editorKey: number
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

            return {
                text: "",
                images,
                editorState: null,
                externalEmbed,
                visualization: null,
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


export const ThreadEditor = ({
                                 postView,
    replyTo,
    onClose,
    selection,
    quotedPost,
    setHidden,
    handleSubmit,
    isVoteReject=false
}: {
    postView?: ArCabildoabiertoFeedDefs.PostView
    replyTo?: ReplyToContent
    onClose: () => void
    selection?: MarkdownSelection | LexicalSelection
    quotedPost?: ArCabildoabiertoEmbedRecord.View["record"]
    setHidden?: (v: boolean) => void
    handleSubmit: (_: CreatePostProps) => Promise<{ error?: string }>
    isVoteReject?: boolean
}) => {
    const [nextEditorKey, setNextEditorKey] = useState(1)
    const initialThreadElementState = useInitialThreadElementState(0, postView)
    const [thread, setThread] = useState<ThreadElementState[]>([initialThreadElementState])
    const [selectedThreadIndex, setSelectedThreadIndex] = useState(0)
    const {enDiscusion, setEnDiscusion} = useEnDiscusionForWritePost(replyTo, postView)
    const [forceEditModalOpen, setForceEditModalOpen] = useState(false)

    function onDelete(i: number) {
        if(i == thread.length-1){
            setSelectedThreadIndex(i-1)
        }
        setThread(thread.filter((_, j) => j != i))
    }

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
                visualization: e.visualization ? visualizationViewToMain(e.visualization) : undefined,
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

    return <div className={""}>
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
                    setThreadElementState={(t) => {
                        setThread(thread.map((e, i) => i == selectedThreadIndex ? t : e))
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
        {forceEditModalOpen && <BaseFullscreenPopup open={true}>
            <div className={"pb-4 pt-8 space-y-8"}>
                <div className={"font-light text-[var(--text-light)] text-sm max-w-[400px] px-8"}>
                    La publicación ya fue referenciada. Si la editás ahora el cambio se va a ver reflejado en Cabildo
                    Abierto pero no en Bluesky.
                </div>
                <div className={"flex space-x-2 justify-center"}>
                    <BaseButton
                        variant={"outlined"}
                        size={"small"}
                        onClick={() => {
                            setForceEditModalOpen(false)
                        }}
                    >
                        Cancelar
                    </BaseButton>
                    <StateButton
                        variant={"outlined"}
                        size={"small"}
                        handleClick={async () => {
                            const {error} = await handleClickSubmit(true)
                            if (!error) {
                                setForceEditModalOpen(false)
                            }
                            return {error}
                        }}
                    >
                        Editar igualmente
                    </StateButton>
                </div>
            </div>
        </BaseFullscreenPopup>}
    </div>
}