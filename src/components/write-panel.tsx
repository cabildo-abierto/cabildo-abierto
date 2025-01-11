import React, { useState } from "react"
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
import {InsertVisualizationModal} from "./writing/insert-visualization-modal";
import dynamic from "next/dynamic";
import SelectionComponent from "./search-selection-component";
import {Button, TextField} from "@mui/material";
import {useRouter} from "next/navigation";
import {ErrorMsg, validEntityName} from "./write-button";
import TickButton from "./tick-button";
import {useSWRConfig} from "swr";
import {createTopic} from "../actions/topics";
import {articleUrl} from "./utils";
import Link from "next/link";
import {BasicButton} from "./ui-utils/basic-button";

const VegaLite = dynamic(() => import("react-vega").then((mod) => mod.VegaLite), {
    ssr: false,
});

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

type WritePanelProps = {
    replyTo?: FeedContentProps
    open: boolean
    onClose: () => void
}


const CreateTopic = ({onClose}: {onClose: () => void}) => {
    const user = useUser();
    const [topicName, setTopicName] = useState("");
    const [errorOnCreate, setErrorOnCreate] = useState(null)
    const { mutate } = useSWRConfig();
    const router = useRouter();
    const [goToArticle, setGoToArticle] = useState(true);
    const [selected, setSelected] = useState("none")

    async function onSubmit(){
        setErrorOnCreate(null)
        const { error } = await createTopic(topicName);

        if(error){
            if(error == "exists"){
                setErrorOnCreate("Ya existe ese tema.")
                return {}
            } else {
                return {error}
            }
        }
        //mutate("/api/entities")
        //mutate("/api/entity/"+topicName)
        if (goToArticle) router.push(articleUrl(topicName))
        onClose()
        return {}
    }

    if(selected == "none"){
        return <div className={"flex justify-center items-center min-h-64"}>
            <div className={"flex space-x-2 h-full"}>
                <Link href={"/temas"}>
                    <BasicButton
                        sx={{width: "128px"}}
                    >
                        Editar un tema
                    </BasicButton>
                </Link>
                <BasicButton
                    onClick={() => {setSelected("new")}}
                    sx={{width: "128px"}}
                >
                    Nuevo tema
                </BasicButton>
            </div>
        </div>
    }

    return <div className="space-y-3 px-6 mb-2 flex flex-col items-center">
        <h3>Elegí un título para el nuevo tema</h3>
        <div>
            <TextField
                value={topicName}
                label={"Título"}
                size={"small"}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="Título"
                inputProps={{
                    autoComplete: 'off', // Disables browser autocomplete
                }}
            />
        </div>
        {errorOnCreate && <ErrorMsg text={errorOnCreate}/>}
        {topicName.includes("/") && <ErrorMsg text="El nombre no puede incluír el caracter '/'."/>}

        <div className="flex justify-center">
            <div className="text-[var(--text-light)] text-xs sm:text-sm text-center max-w-64">
                Antes de crear un nuevo tema mirá que no exista un tema similar.
            </div>
        </div>

        <TickButton ticked={goToArticle} setTicked={setGoToArticle} size={20} color="#455dc0"
                    text={<span className="text-sm">Ir a la página del tema después de crearlo</span>}/>

        <div className="py-4 space-x-2 text-[var(--text-light)]">
            <BasicButton
                onClick={() => {setSelected("none")}}
                variant={"text"}
                color={"inherit"}
            >
                Volver
            </BasicButton>
            <StateButton
                handleClick={onSubmit}
                disabled={!user.user || !validEntityName(topicName)}
                textClassName="title px-4"
                text1="Crear tema"
            />
        </div>

    </div>
}


const WriteFastPost = ({replyTo, onClose}) => {
    const {user} = useUser();
    const [editorKey, setEditorKey] = useState(0);
    const [errorOnCreatePost, setErrorOnCreatePost] = useState(false)
    const [images, setImages] = useState([])
    const [text, setText] = useState("")
    const [visualization, setVisualization] = useState(null)
    const [visualizationModalOpen, setVisualizationModalOpen] = useState(false)


    const charLimit = 300

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
            minRows={5}
            value={text}
            onChange={(e) => {setText(e.target.value)}}
            placeholder={replyTo == undefined ? "¿Qué está pasando?" : "Escribí una respuesta"}
            className={"outline-none resize-none bg-transparent w-full"}
        />
        {charLimit && <ExtraChars charLimit={charLimit} count={text.length}/>}
    </>

    async function handleSubmit() {
        setErrorOnCreatePost(false)
        if (user) {
            const reply = replyTo ? replyFromParentElement(replyTo) : undefined
            const {error} = await createFastPost({text, reply, visualization});

            if (!error) {
                setEditorKey(editorKey + 1);
                onClose()
            } else {
                setErrorOnCreatePost(true)
            }
        }
        setErrorOnCreatePost(true)
        return {}
    }

    return <div className={"min-h-64 flex flex-col justify-between"}>
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
        <div>
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
        </div>

        <InsertVisualizationModal
            open={visualizationModalOpen}
            onClose={() => {setVisualizationModalOpen(false)}}
            setVisualization={setVisualization}
        />

    </div>
}


export const WritePanel = ({replyTo, open, onClose}: WritePanelProps) => {
    const {user} = useUser();
    const [selected, setSelected] = useState("Post")
    const router = useRouter()

    if (!user) {
        return <NeedAccountPopup open={open} text="Necesitás una cuenta para escribir" onClose={onClose}/>
    }

    function optionsNodes(o: string, isSelected: boolean){
        return <div className="text-[var(--text)] text-sm">
            <Button
                onClick={() => {}}
                variant="text"
                color="inherit"
                size={"small"}
                fullWidth={true}
                disableElevation={true}
                sx={{textTransform: "none",
                    paddingY: 0,
                    backgroundColor: isSelected ? "var(--background-dark)" : "transparent",
                    ":hover": {
                        backgroundColor: "var(--background-dark)"
                    }
                }}
            >
                <div className={"text-[var(--text-light)]"}>
                    {o}
                </div>
            </Button>
        </div>
    }

    function onSelection(o: string){
        if(o == "Artículo"){
            router.push("/escribir/articulo")
        } else {
            setSelected(o)
        }
    }

    const center = <>
        <div className="flex justify-between px-1">
            {!replyTo && <SelectionComponent
                onSelection={onSelection}
                selected={selected}
                optionsNodes={optionsNodes}
                options={["Post", "Artículo", "Tema"]}
                className={"flex space-x-2"}
            />}
            <CloseButton onClose={onClose}/>
        </div>
        {selected == "Post" && <WriteFastPost onClose={onClose} replyTo={replyTo}/>}
        {selected == "Tema" && <CreateTopic onClose={onClose}/>}
    </>

    return <>
        <BaseFullscreenPopup open={open} className="w-128">
            <div className="w-full rounded pb-2 pt-1 border">
                {center}
            </div>
        </BaseFullscreenPopup>
    </>
};

