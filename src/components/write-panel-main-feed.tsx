import { useState } from "react"
import StateButton from "./state-button"
import { useUser } from "../app/hooks/user"
import { mutate } from "swr"
import { createFastPost } from "../actions/contents"
import { ExtraChars } from "./extra-chars"
import { ContentTopRowAuthor } from "./content"
import useModal from "./editor/hooks/useModal"
import { FastPostImagesEditor } from "./fast-post-images-editor"
import { BaseFullscreenPopup } from "./ui-utils/base-fullscreen-popup"
import { CloseButton } from "./ui-utils/close-button"
import { AddImageButton } from "./add-image-button"
import { TextareaAutosize } from '@mui/base/TextareaAutosize';


export const WritePanelMainFeed = ({open, onClose}: {open: boolean, onClose: () => void, mobile?: boolean}) => {
    const { user } = useUser();
    const [editorKey, setEditorKey] = useState(0);
    const [randomPlaceholder, setRandomPlaceholder] = useState<string>("")
    const [errorOnCreatePost, setErrorOnCreatePost] = useState(false)
    const [modal, showModal] = useModal();
    const [images, setImages] = useState([])
    const [text, setText] = useState("")

    const charLimit = 300

    async function handleSubmit() {
        setErrorOnCreatePost(false)
        if (user) {
            const {error} = await createFastPost(text);

            if(!error){
                mutate("/api/feed/");
                mutate("/api/following-feed/")
                mutate("/api/profile-feed/" + user.id);
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
        text1="Publicar"
        handleClick={handleSubmit}
        disabled={disabled}
        textClassName="title"
        size="medium"
        disableElevation={true}
    />

    const editorComp = <div className="sm:text-lg py-2 h-full max-h-[400px] w-full" key={editorKey}>
        <TextareaAutosize
            minRows={3}
            value={text}
            onChange={(e) => {setText(e.target.value)}}
            placeholder="¿Qué está pasando?"
            className="w-full outline-none resize-none"
        />
        {charLimit && <ExtraChars charLimit={charLimit} count={text.length}/>}
    </div>

    const center = <>
        <div className="flex justify-between px-1">
            <div className="text-sm text-gray-400 flex items-center ml-2">
                <ContentTopRowAuthor content={{author: user}}/>
            </div>
            <CloseButton onClose={onClose}/>
        </div>
        <div className="min-h-[250px] px-2">
        <div className="sm:text-lg py-2 px-1 h-full w-full" key={editorKey}>
            {editorComp}
        </div>
            <FastPostImagesEditor images={images} setImages={setImages}/>
        </div>
        <hr className="border-gray-200" />
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

    return (
        <BaseFullscreenPopup open={open} className="w-128">
            <div className="w-full rounded pb-2 pt-1">
                {center}
                {errorOnCreatePost && <div className="flex justify-end text-sm text-red-600">Ocurrió un error al publicar. Intentá de nuevo.</div>}
            </div>
        </BaseFullscreenPopup>
    );
};

