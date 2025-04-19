"use client"

import {ReplyToContent} from "../../../modules/ca-lexical-editor/src/plugins/CommentPlugin";
import React, {useState} from "react";
import {useSWRConfig} from "swr";
import StateButton from "../../../modules/ui-utils/src/state-button";
import {ExtraChars} from "./extra-chars";
import {isPost, threadApiUrl} from "@/utils/uri";
import {RectTracker} from "../../../modules/ui-utils/src/rect-tracker";
import {ProfilePic} from "../feed/profile-pic";
import {VisualizationNodeComp} from "../../../modules/ca-lexical-editor/src/nodes/visualization-node-comp";
import {FastPostImagesEditor} from "./fast-post-images-editor";
import {AddImageButton} from "./add-image-button";
import {AddVisualizationButton} from "./add-visualization-button";
import {InsertVisualizationModal} from "./insert-visualization-modal";
import {InsertImageModal} from "./insert-image-modal";
import {FastPostProps, FastPostReplyProps} from "@/lib/definitions";
import {useUser} from "@/hooks/swr";
import {FastPostEditor} from "@/components/editor/fast-post-editor";
import {Star, StarBorder} from "@mui/icons-material";
import {ToolbarButton} from "../../../modules/ca-lexical-editor/src/plugins/ToolbarPlugin/toolbar-button";


function replyFromParentElement(replyTo: ReplyToContent): FastPostReplyProps {

    if(isPost(replyTo.collection)){
        const post = replyTo as FastPostProps
        console.log("post", post)
        const parent = {
            uri: post.uri,
            cid: post.cid
        }
        if(post.content.post.root){
            return {
                parent,
                root: {
                    uri: post.content.post.root.uri,
                    cid: post.content.post.root.cid
                }
            }
        } else {
            return {
                parent,
                root: {...parent}
            }
        }
    } else if(["ar.com.cabildoabierto.article", "ar.com.cabildoabierto.visualization", "ar.com.cabildoabierto.dataset", "ar.com.cabildoabierto.topic"].includes(replyTo.collection)){
        const parent = {
            uri: replyTo.uri,
            cid: replyTo.cid
        }
        return {
            parent,
            root: parent
        }
    } else {
        throw Error("Not implemented.")
    }
}


export const WriteFastPost = ({replyTo, onClose, quote, onSubmit}: {
    replyTo: ReplyToContent,
    quote?: [number, number]
    onClose: () => void
    onSubmit: () => Promise<void>
}) => {
    const {user} = useUser()
    const [editorKey, setEditorKey] = useState(0)
    const [errorOnCreatePost, setErrorOnCreatePost] = useState(false)
    const [images, setImages] = useState<{src?: string, formData?: FormData}[] | null>(null)
    const [text, setText] = useState("")
    const [visualization, setVisualization] = useState(null)
    const [visualizationModalOpen, setVisualizationModalOpen] = useState(false)
    const [imageModalOpen, setImageModalOpen] = useState(false)
    const [rect, setRect] = useState<DOMRect>()
    const {mutate} = useSWRConfig()
    const [enDiscusion, setEnDiscusion] = useState(false)

    const charLimit = 300

    const valid = (text.length > 0 && text.length <= 300) || (images && images.length > 0) || visualization != null

    let disabled = !valid

    const isReply = replyTo != undefined

    let placeholder: string
    if(!isReply){
        placeholder = "¿Qué está pasando?"
    } else if(replyTo.collection == "app.bsky.feed.post" || replyTo.collection == "ar.com.cabildoabierto.quotePost"){
        placeholder = "Escribí una respuesta"
    } else if(replyTo.collection == "ar.com.cabildoabierto.article"){
        placeholder = "Respondé al artículo"
    } else if(replyTo.collection == "ar.com.cabildoabierto.topic"){
        placeholder = "Respondé al tema"
    } else if(replyTo.collection == "ar.com.cabildoabierto.visualization"){
        placeholder = "Respondé a la visualización"
    } else if(replyTo.collection == "ar.com.cabildoabierto.dataset"){
        placeholder = "Respondé al conjunto de datos"
    }

    async function handleSubmit() {
        setErrorOnCreatePost(false)
        const reply = replyTo ? replyFromParentElement(replyTo) : undefined
        const {error} = await createFastPost({text, reply, visualization, quote, images, enDiscusion})

        if(reply){
            await onSubmit()
            await mutate(threadApiUrl(reply.parent.uri))
            await mutate(threadApiUrl(reply.root.uri))
            if(replyTo.content.topicVersion){
                const id = replyTo.content.topicVersion.topic.id
                await mutate("/api/topic/"+encodeURIComponent(id))
                await mutate("/api/topic-feed/"+encodeURIComponent(id))
            }
        }

        if (!error) {
            setEditorKey(editorKey + 1);
            onClose()
        } else {
            setErrorOnCreatePost(true)
        }
        return {}
    }

    return <RectTracker setRect={setRect}>
        <div className={"min-h-64 flex flex-col justify-between"}>
            <div className="px-2 w-full mb-2">
                <div className="flex space-x-2 w-full mt-2">
                    <ProfilePic user={user} className={"w-8 h-8 rounded-full"}/>
                    <div className="sm:text-lg w-full" key={editorKey}>
                        <FastPostEditor
                            setText={setText}
                            placeholder={placeholder}
                        />
                        {charLimit && <ExtraChars charLimit={charLimit} count={text.length}/>}
                    </div>
                </div>
                {visualization && <VisualizationNodeComp
                    visualization={visualization}
                    showEngagement={false}
                    width={rect.width-20}
                />}
                {images && <FastPostImagesEditor images={images} setImages={setImages}/>}
                {errorOnCreatePost && <div className={"px-2 text-sm text-[var(--text-light)]"}>
                    Ocurrió un error al intentar crear el post.
                </div>}
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
                        onClick={() => {setEnDiscusion(!enDiscusion)}}
                        title={"Agregar este post al feed En discusión."}
                        aria-label={""}
                    >
                        {enDiscusion ? <Star fontSize={"small"}/> : <StarBorder fontSize={"small"}/>}
                    </ToolbarButton>
                    <StateButton
                        text1={isReply ? "Responder" : "Publicar"}
                        handleClick={handleSubmit}
                        disabled={disabled}
                        textClassName="font-semibold"
                        size="small"
                        sx={{borderRadius: 20}}
                    />
                </div>
            </div>
            <InsertVisualizationModal
                open={visualizationModalOpen}
                onClose={() => {setVisualizationModalOpen(false)}}
                setVisualization={setVisualization}
            />
            <InsertImageModal
                open={imageModalOpen}
                onClose={() => {setImageModalOpen(false)}}
                onSubmit={(i: {src: string}) => {
                    if(images != null) {
                        setImages([...images, i])
                    } else {
                        setImages([i])
                    }
                    setImageModalOpen(false)
                }}
            />
        </div>
    </RectTracker>
}