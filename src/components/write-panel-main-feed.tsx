import { LexicalEditor, EditorState } from "lexical"
import { useState, useEffect, JSX, useRef } from "react"
import dynamic from 'next/dynamic'
import { commentEditorSettings } from "./editor/comment-editor"
import StateButton from "./state-button"
import { FastPostIcon, LinkIcon } from "./icons"
import { useUser } from "../app/hooks/user"
import { mutate } from "swr"
import { createPost } from "../actions/contents"
import { compress } from "./compression"
import { charCount, emptyOutput, validPost } from "./utils"
import { ExtraChars } from "./extra-chars"
import { CloseButton } from "./close-button"
import { ContentTopRowAuthor } from "./content"
import { DialogButtonsList } from "./editor/ui/Dialog"
import { Button } from "@mui/material"
import { InsertImagePayload, InsertImageUploadedDialogBody, InsertImageUriDialogBody, UploadImageButton } from "./editor/plugins/ImagesPlugin"
import useModal from "./editor/hooks/useModal"
import Image from "next/image"
import { FastPostImagesEditor } from "./fast-post-images-editor"

const MyLexicalEditor = dynamic(() => import('./editor/lexical-editor'), { ssr: false });



export function InsertImageDialog({
    onSubmit,
  }: {
    onSubmit: (payload: InsertImagePayload) => void;
  }): JSX.Element {
    const [mode, setMode] = useState<null | 'url' | 'file'>(null);

    return (
      <div className="max-w-screen flex flex-col items-center">
        <div className="w-48">
        {!mode && (
          <DialogButtonsList>
            <Button
              variant="contained"
              sx={{textTransform: "none"}}
              disableElevation={true}
              startIcon={<LinkIcon/>}
              onClick={() => setMode('url')}>
              Desde un URL
            </Button>
            <UploadImageButton
                onSubmit={onSubmit}
            />
          </DialogButtonsList>
        )}
        </div>
        {mode === 'url' && <InsertImageUriDialogBody onClick={onSubmit} />}
      </div>
    );
}


export const AddImageButton = ({images, setImages, showModal}: {images: InsertImagePayload[], setImages: (images: InsertImagePayload[]) => void, showModal: any}) => {
    return <button
        onClick={() => {
        showModal('Insertar una imágen', (onClose: any) => (
            <InsertImageDialog
            onSubmit={(payload: InsertImagePayload) => {
                setImages([...images, payload])
                onClose()
            }}
            />
        ));
        }}
        disabled={images.length >= 4}
        type="button"
        title="Insertar imágen"
        className="toolbar-item spaced"
        aria-label="Insertar imágen">
        <i className="format image" />
    </button>
}


export const WritePanelMainFeed = ({onClose}: {onClose: () => void, mobile?: boolean}) => {
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

    console.log("disabled:", editor, emptyOutput(editorState), images.length, valid.problem)

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
        <div className="flex justify-between px-2">
            <div className="text-sm text-gray-400 flex items-center">
                <ContentTopRowAuthor content={{author: user}}/>
            </div>
            <CloseButton onClose={onClose}/>
        </div>
        <div className="min-h-[250px]">
        <div className="sm:text-lg py-2 px-3 h-full w-full" key={editorKey}>
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
        <div className="w-full rounded pb-2 pt-1">
            {center}
            {errorOnCreatePost && <div className="flex justify-end text-sm text-red-600">Ocurrió un error al publicar. Intentá de nuevo.</div>}
        </div>
    );
};

