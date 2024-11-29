import { LexicalEditor, EditorState } from "lexical"
import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
import { commentEditorSettings } from "./editor/comment-editor"
import StateButton from "./state-button"
import { useUser } from "../app/hooks/user"
import { mutate } from "swr"
import { createPost } from "../actions/contents"
import { compress } from "./compression"
import { charCount, validPost } from "./utils"
import { ExtraChars } from "./extra-chars"
import { ContentTopRowAuthor } from "./content"
import useModal from "./editor/hooks/useModal"
import { FastPostImagesEditor } from "./fast-post-images-editor"
import { BaseFullscreenPopup } from "./ui-utils/base-fullscreen-popup"
import { CloseButton } from "./ui-utils/close-button"
import { AddImageButton } from "./add-image-button"

const MyLexicalEditor = dynamic(() => import('./editor/lexical-editor'), { ssr: false });


export const WritePanelMainFeed = ({open, onClose}: {open: boolean, onClose: () => void, mobile?: boolean}) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined);
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined);
    const { user } = useUser();
    const [editorKey, setEditorKey] = useState(0);
    const [randomPlaceholder, setRandomPlaceholder] = useState<string>("")
    const [errorOnCreatePost, setErrorOnCreatePost] = useState(false)
    const [modal, showModal] = useModal();
    const [images, setImages] = useState([])

    const placeholders = [
        "Una ráfaga comunicacional de menos de 300 caracteres...",
    ];

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * placeholders.length);
        setRandomPlaceholder(placeholders[randomIndex]);
    }, []);

    const settings = { ...commentEditorSettings };
    settings.placeholder = randomPlaceholder;
    settings.editorClassName = "min-h-[50px] w-full content comment"
    settings.placeholderClassName = "absolute top-0 text-[var(--text-lighter)] pointer-events-none"
    settings.imageClassName = "fastpost-image"

    async function handleSubmit() {
        setErrorOnCreatePost(false)
        if (editor && user) {
            const json = editor.getEditorState().toJSON()

            json["images"] = images

            const text = JSON.stringify(json);
            
            const compressedText = compress(text);
            const {error} = await createPost(compressedText, "FastPost", false, user.id, undefined);
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

    const valid = validPost(editorState, settings.charLimit, "FastPost", images)

    const count = editor && editorState ? charCount(editorState) : 0;
    let disabled = valid.problem != undefined;

    const sendButton = <StateButton
        text1="Publicar"
        handleClick={handleSubmit}
        disabled={disabled}
        textClassName="title"
        size="medium"
        disableElevation={true}
    />

    const editorComp = <div className="sm:text-lg py-2 h-full max-h-[400px] w-full" key={editorKey}>
        <MyLexicalEditor
            settings={settings}
            setEditorState={setEditorState}
            setEditor={setEditor}
        />
        {settings.charLimit && <ExtraChars charLimit={settings.charLimit} count={count}/>}
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

