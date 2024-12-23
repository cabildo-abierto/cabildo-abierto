import { useState } from "react"
import StateButton from "./state-button"
import { useUser } from "../hooks/user"
import { createFastPost } from "../actions/contents"
import { ExtraChars } from "./extra-chars"
import useModal from "./editor/hooks/useModal"
import { FastPostImagesEditor } from "./fast-post-images-editor"
import { BaseFullscreenPopup } from "./ui-utils/base-fullscreen-popup"
import { CloseButton } from "./ui-utils/close-button"
import { AddImageButton } from "./add-image-button"
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { NeedAccountPopup } from "./need-account-popup"
import {ProfilePic} from "./feed/profile-pic";
import {FastPostProps, FastPostReplyProps, FeedContentProps} from "../app/lib/definitions";

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
    const [modal, showModal] = useModal();
    const [images, setImages] = useState([])
    const [text, setText] = useState("")

    if(!user){
        return <NeedAccountPopup open={open} text="Necesitás una cuenta para escribir" onClose={onClose}/>
    }

    const charLimit = 300

    async function handleSubmit() {
        setErrorOnCreatePost(false)
        if (user) {
            const reply = replyFromParentElement(replyTo)
            const {error} = await createFastPost({text: text, reply: reply});

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

    const valid = text.length > 0 && text.length <= 300

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
            <CloseButton onClose={onClose}/>
        </div>
        <div className="px-2 w-full">
            <div className="flex space-x-2 w-full">
                <ProfilePic user={user} className={"w-8 h-8 rounded-full"}/>
                <div className="sm:text-lg w-full" key={editorKey}>
                    {editorComp}
                </div>
            </div>
            <FastPostImagesEditor images={images} setImages={setImages}/>
        </div>
        <hr className="" />
        <div className="flex justify-between mt-2 px-2">
            <AddImageButton
                images={images}
                setImages={setImages}
                showModal={showModal}
            />
            {sendButton}
        </div>
        {modal}
    </>

    return <BaseFullscreenPopup open={open} className="w-128">
        <div className="w-full rounded pb-2 pt-1 border">
            {center}
            {errorOnCreatePost && <div className="flex justify-end text-sm text-red-600">Ocurrió un error al publicar. Intentá de nuevo.</div>}
        </div>
    </BaseFullscreenPopup>
};

