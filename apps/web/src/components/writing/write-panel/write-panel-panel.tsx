import React, {useMemo, useState} from "react"
import {BaseFullscreenPopup} from "../../utils/dialogs/base-fullscreen-popup"
import {CloseButton} from "@/components/utils/base/close-button"
import SelectionComponent from "../../buscar/search-selection-component";
import {useRouter} from "next/navigation";
import {CreateTopic} from "./create-topic";
import {CreatePostProps, WritePost} from "./write-post";
import {emptyChar} from "../../utils/utils";
import {
    ArCabildoabiertoFeedDefs,
    ArCabildoabiertoEmbedRecord,
    ImagePayload,
    ArCabildoabiertoEmbedVisualization
} from "@cabildo-abierto/api"
import {BaseButton} from "@/components/utils/base/base-button";
import {ReplyToContent} from "./write-panel";
import {MarkdownSelection} from "@/components/editor/selection/markdown-selection";
import {LexicalSelection} from "@/components/editor/selection/lexical-selection";
import {$Typed, AppBskyEmbedExternal, AppBskyEmbedImages} from "@atproto/api";
import {EditorState} from "lexical";
import {hasEnDiscusionLabel} from "@/components/feed/utils/post-preview-frame";
import {UnselectedThreadElement} from "@/components/writing/write-panel/unselected-thread-element";
import {getAllText} from "@cabildo-abierto/editor-core";


type WritePanelProps = {
    replyTo?: ReplyToContent
    open: boolean
    onClose: () => void
    selection?: MarkdownSelection | LexicalSelection
    quotedPost?: ArCabildoabiertoEmbedRecord.View["record"]
    handleSubmit: (_: CreatePostProps) => Promise<{ error?: string }>
    postView?: ArCabildoabiertoFeedDefs.PostView
}


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
}


const emptyThreadElementState: ThreadElementState = {
    text: "",
    images: [],
    editorState: null,
    externalEmbed: null,
    visualization: null
}


function useInitialThreadElementState(postView?: ArCabildoabiertoFeedDefs.PostView): ThreadElementState {

    return useMemo(() => {
        if (!postView) {
            return emptyThreadElementState
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
                visualization: null
            }
        }
    }, [postView])
}


function useEnDiscusionForWritePost(replyTo: ReplyToContent, postView?: ArCabildoabiertoFeedDefs.PostView) {
    const initialState = postView ? hasEnDiscusionLabel(postView) : !replyTo
    const [enDiscusion, setEnDiscusion] = useState(initialState)

    return {enDiscusion, setEnDiscusion}
}

function emptyEditorState(editorState: EditorState | null) {
    return editorState == null || getAllText(editorState.toJSON().root).trim().length == 0
}

export function isThreadElementStateEmpty(threadElementState: ThreadElementState) {
    return threadElementState.text.length == 0 && threadElementState.images.length == 0 && emptyEditorState(threadElementState.editorState) && threadElementState.externalEmbed?.url == null && threadElementState.visualization == null
}


const WritePanelPanel = ({
                             replyTo,
                             open,
                             onClose,
                             selection,
                             quotedPost,
                             handleSubmit,
                             postView,
                         }: WritePanelProps) => {
    const [selected, setSelected] = useState("Publicación")
    const router = useRouter()
    const [hidden, setHidden] = useState(false)
    const initialThreadElementState = useInitialThreadElementState(postView)
    const [thread, setThread] = useState<ThreadElementState[]>([initialThreadElementState])
    const [selectedThreadIndex, setSelectedThreadIndex] = useState(0)
    const {enDiscusion, setEnDiscusion} = useEnDiscusionForWritePost(replyTo, postView)
    const isReply = replyTo != undefined

    console.log("thread elements", thread.map(t => t.text))

    function optionsNodes(o: string, isSelected: boolean) {
        return <div className="text-[var(--text)] text-sm">
            <BaseButton
                size={"small"}
                variant={"default"}
                className={"w-full py-0"}
            >
                <div className={"px-2 py-[2px]"}>
                    <div
                        className={"uppercase text-[11px] font-semibold " + (isSelected ? "border-b-2 border-[var(--text-light)]" : "")}
                    >
                        {o}
                    </div>
                </div>
            </BaseButton>
        </div>
    }

    function onSelection(o: string) {
        if (o == "Artículo") {
            router.push("/escribir/articulo")
            onClose()
        } else {
            setSelected(o)
        }
    }

    return (
        <BaseFullscreenPopup
            hidden={hidden}
            open={open}
            className="w-full max-w-[512px] sm:w-full"
            backgroundShadow={replyTo == null && quotedPost == null}
            overlayClassName={"z-[1399]"}
        >
            <div
                className="w-full rounded pt-1 max-h-[80vh] min-h-[334px] flex flex-col justify-between overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start space-x-2 pl-1 pr-1">
                    {!isReply && !quotedPost ? <SelectionComponent
                        onSelection={onSelection}
                        selected={selected}
                        optionsNodes={optionsNodes}
                        options={["Publicación", "Artículo", "Tema"]}
                        className={"flex space-x-2"}
                    /> : <div>{emptyChar}</div>}
                    <CloseButton
                        size={"small"}
                        onClose={() => {
                            onClose()
                        }}
                    />
                </div>
                {selected == "Publicación" && <div className={""}>
                    {thread.map((e, i) => {
                        if (i == selectedThreadIndex) {
                            return <WritePost
                                onClose={onClose}
                                replyTo={replyTo}
                                selection={selection}
                                quotedContent={quotedPost}
                                setHidden={setHidden}
                                handleSubmit={handleSubmit}
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
                                        emptyThreadElementState,
                                        ...thread.slice(selectedThreadIndex + 1)
                                    ])
                                    setSelectedThreadIndex(selectedThreadIndex + 1)
                                }}
                                key={i}
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
                    })}</div>}
                {selected == "Tema" && <CreateTopic onClose={onClose}/>}
            </div>
        </BaseFullscreenPopup>
    )
};


export default WritePanelPanel;
