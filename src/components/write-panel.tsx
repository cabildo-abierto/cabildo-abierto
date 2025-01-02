import { useState } from "react"
import StateButton from "./state-button"
import { useUser } from "../hooks/user"
import { createFastPost } from "../actions/contents"
import { ExtraChars } from "./extra-chars"
import { FastPostImagesEditor } from "./fast-post-images-editor"
import { BaseFullscreenPopup } from "./ui-utils/base-fullscreen-popup"
import { CloseButton } from "./ui-utils/close-button"
import { AddImageButton } from "./add-image-button"
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { NeedAccountPopup } from "./need-account-popup"
import {ProfilePic} from "./feed/profile-pic";
import {FastPostProps, FastPostReplyProps, FeedContentProps} from "../app/lib/definitions";
import {AddVisualizationButton} from "./add-visualization-button";
import {TextField} from "@mui/material";
import SearchableDropdown from "./ui-utils/searchable-dropdown";
import {InsertVisualizationModal} from "./writing/insert-visualization-modal";
import {Plot} from "./visualizations/plot";
import {VegaLite} from "react-vega";
import {UploadImageButton} from "./editor/plugins/ImagesPlugin";

type WritePanelProps = {
    replyTo?: FeedContentProps
    open: boolean
    onClose: () => void
}

function replyFromParentElement(replyTo: FeedContentProps): FastPostReplyProps {

    if(replyTo.collection == "app.bsky.feed.post"){
        const post = replyTo as FastPostProps
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
    } else if(replyTo.collection == "ar.com.cabildoabierto.article"){
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

export const WritePanel = ({replyTo, open, onClose}: WritePanelProps) => {
    const { user } = useUser();
    const [editorKey, setEditorKey] = useState(0);
    const [errorOnCreatePost, setErrorOnCreatePost] = useState(false)
    const [images, setImages] = useState([])
    const [text, setText] = useState("")
    const [visualization, setVisualization] = useState(null)
    const [visualizationModalOpen, setVisualizationModalOpen] = useState(false)

    if(!user){
        return <NeedAccountPopup open={open} text="Necesitás una cuenta para escribir" onClose={onClose}/>
    }

    const charLimit = 300

    async function handleSubmit() {
        setErrorOnCreatePost(false)
        if (user) {
            const reply = replyTo ? replyFromParentElement(replyTo) : undefined
            const {error} = await createFastPost({text, reply, visualization});

            if(!error){
                setEditorKey(editorKey + 1);
                onClose()
            } else {
                setErrorOnCreatePost(true)
            }
        }
        setErrorOnCreatePost(true)
        return {}
    }

    const valid = (text.length > 0 && text.length <= 300) || images.length > 0 || visualization != null

    let disabled = !valid

    const sendButton = <StateButton
        text1={replyTo == undefined ? "Publicar" : "Responder"}
        handleClick={handleSubmit}
        disabled={disabled}
        textClassName="font-bold"
        size="medium"
        disableElevation={true}
    />

    const editorComp = <>
        <TextareaAutosize
            minRows={3}
            value={text}
            onChange={(e) => {setText(e.target.value)}}
            placeholder={replyTo == undefined ? "¿Qué está pasando?" : "Escribí una respuesta"}
            className={"outline-none resize-none bg-transparent w-full"}
        />
        {charLimit && <ExtraChars charLimit={charLimit} count={text.length}/>}
    </>

    const center = <>
        <div className="flex justify-end px-1">
            <CloseButton onClose={() => {setVisualization(null); onClose()}}/>
        </div>
        <div className="px-2 w-full">
            <div className="flex space-x-2 w-full">
                <ProfilePic user={user} className={"w-8 h-8 rounded-full"}/>
                <div className="sm:text-lg w-full" key={editorKey}>
                    {editorComp}
                </div>
            </div>
            {visualization && <div className={"flex justify-center z-[20000]"}>
                <VegaLite spec={JSON.parse(visualization.visualization.spec)} actions={false}/>
            </div>}
            <FastPostImagesEditor images={images} setImages={setImages}/>
        </div>
        <hr className=""/>
        <div className="flex justify-between mt-2 px-2">
            <div className={"flex space-x-2"}>
                <AddImageButton
                    images={images}
                    disabled={images.length == 4 || visualization != null}
                    setImages={setImages}
                />
                <AddVisualizationButton
                    setVisualization={setVisualization}
                    disabled={images.length > 0}
                    modalOpen={visualizationModalOpen}
                    setModalOpen={setVisualizationModalOpen}
                />
            </div>
            {sendButton}
        </div>
    </>

    return <>
        <BaseFullscreenPopup open={open} className="w-128">
            <div className="w-full rounded pb-2 pt-1 border">
                {center}
                {errorOnCreatePost && <div className="flex justify-end text-sm text-red-600">Ocurrió un error al publicar. Intentá de nuevo.</div>}
            </div>
        </BaseFullscreenPopup>
        <InsertVisualizationModal
            open={visualizationModalOpen}
            onClose={() => {setVisualizationModalOpen(false)}}
            setVisualization={setVisualization}
        />
    </>
};

