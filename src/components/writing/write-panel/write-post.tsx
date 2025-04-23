import React, {useState} from "react";
import {useSWRConfig} from "swr";
import StateButton from "../../../../modules/ui-utils/src/state-button";
import {ExtraChars} from "./extra-chars";
import {
    getCollectionFromUri,
    isArticle,
    isDataset,
    isPost,
    isTopicVersion,
    isVisualization,
    threadApiUrl
} from "@/utils/uri";
import {RectTracker} from "../../../../modules/ui-utils/src/rect-tracker";
import {ProfilePic} from "../../profile/profile-pic";
import {VisualizationNodeComp} from "../../../../modules/ca-lexical-editor/src/nodes/visualization-node-comp";
import {FastPostImagesEditor} from "./fast-post-images-editor";
import {AddImageButton} from "./add-image-button";
import {AddVisualizationButton} from "./add-visualization-button";
import {InsertVisualizationModal} from "./insert-visualization-modal";
import {InsertImageModal} from "./insert-image-modal";
import {FastPostReplyProps} from "@/lib/types";
import {useSession} from "@/hooks/swr";
import {FastPostEditor} from "@/components/editor/fast-post-editor";
import {Star, StarBorder} from "@mui/icons-material";
import {ToolbarButton} from "../../../../modules/ca-lexical-editor/src/plugins/ToolbarPlugin/toolbar-button";
import {ReplyToContent} from "@/components/writing/write-panel/write-panel";
import {isPostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {Record as PostRecord} from "@/lex-api/types/app/bsky/feed/post"
import {post} from "@/utils/fetch";


function replyFromParentElement(replyTo: ReplyToContent): FastPostReplyProps {
    if (isPostView(replyTo)) {
        const parent = {
            uri: replyTo.uri,
            cid: replyTo.cid
        }
        if ((replyTo.record as PostRecord).reply) {
            return {
                parent,
                root: (replyTo.record as PostRecord).reply.root
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


export type ImagePayload = {src: string, $type: "url"} | {image: string, $type: "str"}

export type CreatePostProps = {
    text: string
    reply?: FastPostReplyProps
    selection?: [number, number]
    images?: ImagePayload[]
    enDiscusion?: boolean
}


async function createPost(body: CreatePostProps): Promise<{
    error?: string
}> {
    return post({
        route: "/post",
        body: body
    })
}


function getPlaceholder(replyToCollection?: string) {
    if (!replyToCollection) {
        return "¿Qué está pasando?"
    } else if (isPost(replyToCollection)) {
        return "Escribí una respuesta"
    } else if (isArticle(replyToCollection)) {
        return "Respondé al artículo"
    } else if (isTopicVersion(replyToCollection)) {
        return "Respondé al tema"
    } else if (isVisualization(replyToCollection)) {
        return "Respondé a la visualización"
    } else if (isDataset(replyToCollection)) {
        return "Respondé al conjunto de datos"
    }
}


export const WritePost = ({replyTo, onClose, selection, onSubmit}: {
    replyTo: ReplyToContent,
    selection?: [number, number]
    onClose: () => void
    onSubmit: () => Promise<void>
}) => {
    const {user} = useSession()
    const [editorKey, setEditorKey] = useState(0)
    const [images, setImages] = useState<ImagePayload[]>([])
    const [text, setText] = useState("")
    const [visualization, setVisualization] = useState(null)
    const [visualizationModalOpen, setVisualizationModalOpen] = useState(false)
    const [imageModalOpen, setImageModalOpen] = useState(false)
    const [rect, setRect] = useState<DOMRect>()
    const {mutate} = useSWRConfig()
    const [enDiscusion, setEnDiscusion] = useState(false)

    const charLimit = 300

    const valid = (text.length > 0 && text.length <= 300) || (images && images.length > 0) || visualization != null

    const isReply = replyTo != undefined
    const replyToCollection = isReply ? getCollectionFromUri(replyTo.uri) : null

    async function handleSubmit() {
        const reply = replyTo ? replyFromParentElement(replyTo) : undefined
        const {error} = await createPost({text, reply, selection, images, enDiscusion})

        if (reply) {
            await onSubmit()
            await mutate(threadApiUrl(reply.parent.uri))
            await mutate(threadApiUrl(reply.root.uri))
            // TO DO
            //if(replyTo.content.topicVersion){
            //    const id = replyTo.content.topicVersion.topic.id
            //    await mutate("/api/topic/"+encodeURIComponent(id))
            //    await mutate("/api/topic-feed/"+encodeURIComponent(id))
            //}
        }

        if (!error) {
            setEditorKey(editorKey + 1);
            onClose()
        }
        return {error}
    }

    return <RectTracker setRect={setRect}>
        <div className={"min-h-64 flex flex-col justify-between"}>
            <div className="px-2 w-full mb-2">
                <div className="flex space-x-2 w-full mt-2">
                    <ProfilePic user={user} className={"w-8 h-8 rounded-full"}/>
                    <div className="sm:text-lg w-full" key={editorKey}>
                        <FastPostEditor
                            setText={setText}
                            placeholder={getPlaceholder(replyToCollection)}
                        />
                        {charLimit && <ExtraChars charLimit={charLimit} count={text.length}/>}
                    </div>
                </div>
                {visualization && <VisualizationNodeComp
                    visualization={visualization}
                    showEngagement={false}
                    width={rect.width - 20}
                />}
                {images && <FastPostImagesEditor images={images} setImages={setImages}/>}
            </div>
            <div className="flex justify-between p-1 border-t items-center">
                <div className={"flex space-x-2 items-center"}>
                    <AddImageButton
                        disabled={images && images.length == 4 || visualization != null}
                        setModalOpen={setImageModalOpen}
                    />
                    <AddVisualizationButton
                        disabled={images && images.length > 0}
                        setModalOpen={setVisualizationModalOpen}
                    />
                </div>
                <div className={"flex space-x-2 text-[var(--text-light)] items-center px-1"}>
                    <ToolbarButton
                        onClick={() => {
                            setEnDiscusion(!enDiscusion)
                        }}
                        title={"Agregar este post al feed En discusión."}
                        aria-label={""}
                    >
                        {enDiscusion ? <Star fontSize={"small"}/> : <StarBorder fontSize={"small"}/>}
                    </ToolbarButton>
                    <StateButton
                        text1={isReply ? "Responder" : "Publicar"}
                        handleClick={handleSubmit}
                        disabled={!valid}
                        textClassName="font-semibold"
                        size="small"
                        sx={{borderRadius: 20}}
                    />
                </div>
            </div>
            <InsertVisualizationModal
                open={visualizationModalOpen}
                onClose={() => {
                    setVisualizationModalOpen(false)
                }}
                setVisualization={setVisualization}
            />
            <InsertImageModal
                open={imageModalOpen}
                onClose={() => {
                    setImageModalOpen(false)
                }}
                onSubmit={(i: { src: string }) => {
                    const image: ImagePayload = {$type: "url", ...i}
                    setImages([...images, image])
                    setImageModalOpen(false)
                }}
            />
        </div>
    </RectTracker>
}