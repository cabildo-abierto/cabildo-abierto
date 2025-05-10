import {EditorState} from "lexical";
import {useRouter} from "next/navigation";
import StateButton, {StateButtonClickHandler} from "../../../../modules/ui-utils/src/state-button";
import {editorStateToMarkdown} from "../../../../modules/ca-lexical-editor/src/markdown-transforms";
import {post} from "@/utils/fetch";
import {Button} from "../../../../modules/ui-utils/src/button";
import {useEffect, useState} from "react";
import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup";
import {ArticlePreviewContent} from "@/components/feed/article/article-preview";
import removeMarkdown from "remove-markdown";
import {IconButton} from "../../../../modules/ui-utils/src/icon-button";
import Newspaper from "@mui/icons-material/Newspaper";

const createArticle = async (text: string, format: string, title: string, enDiscusion: boolean) => {
    return post("/article", {
        text, format, title, enDiscusion
    })
}

type PublishArticleModalProps = {
    open: boolean
    onClose: () => void
    onSubmit: (enDiscusion: boolean) => StateButtonClickHandler
    mdText?: string
    title?: string
}

export function markdownToPlainText(md: string) {
    return removeMarkdown(md).replace(/\n{2,}/g, '\n').trim()
}


export const AddToEnDiscusionButton = ({enDiscusion, setEnDiscusion}: {
    enDiscusion: boolean,
    setEnDiscusion: (e: boolean) => void
}) => {
    return <IconButton
        onClick={() => {
            setEnDiscusion(!enDiscusion)
        }}
        size={"small"}
        color={"background-dark"}
        textColor={enDiscusion ? "text" : "text-light"}
        title={'Agregar al feed "En discusión"'}
    >
        <Newspaper color={"inherit"}/>
    </IconButton>
}

const PublishArticleModal = ({onSubmit, open, onClose, mdText, title}: PublishArticleModalProps) => {
    const [enDiscusion, setEnDiscusion] = useState(false)

    return <BaseFullscreenPopup open={open} onClose={onClose} closeButton={true}>
        <div className={"pb-8 min-w-[320px] max-w-[500px] min-h-[300px] px-6 flex flex-col justify-between space-y-8"}>
            <h2 className={""}>
                Publicar artículo
            </h2>

            <div>
                <div className={"text-sm text-[var(--text-light)] px-1"}>
                    Previsualización
                </div>
                <ArticlePreviewContent color="background-dark2" clickable={false} title={title}
                                       summary={markdownToPlainText(mdText).slice(0, 150).replaceAll("\n", " ")}/>
            </div>

            <div className={"flex justify-between"}>
                <AddToEnDiscusionButton enDiscusion={enDiscusion} setEnDiscusion={setEnDiscusion}/>
                <div className={"space-x-2"}>
                    <Button
                        color={"background-dark"}
                        variant={"text"}
                    >
                        Cancelar
                    </Button>
                    <StateButton
                        text1={"Publicar"}
                        handleClick={onSubmit(enDiscusion)}
                    />
                </div>
            </div>
        </div>
    </BaseFullscreenPopup>
}


export const PublishArticleButton = ({editorState, title, disabled}: {
    editorState: EditorState
    disabled: boolean
    title?: string
}) => {
    const [modalOpen, setModalOpen] = useState(false)
    const router = useRouter()
    const [mdText, setMdText] = useState("")

    useEffect(() => {
        if (editorState && modalOpen) {
            const editorStateStr = JSON.stringify(editorState.toJSON())
            setMdText(editorStateToMarkdown(editorStateStr))
        }
    }, [editorState, modalOpen])

    const handleSubmit = (enDiscusion: boolean) => async () => {
        const {error} = await createArticle(mdText, "markdown", title, enDiscusion)
        if (error) return {error}

        router.push("/inicio?f=siguiendo")
        return {stopResubmit: true}
    }

    return <>
        <StateButton
            onClick={() => {
                setModalOpen(true)
            }}
            text1={"Publicar"}
            textClassName="whitespace-nowrap px-2 font-semibold"
            disabled={disabled}
            color={"background"}
            size="medium"
            variant={"text"}
            sx={{borderRadius: 20}}
        />
        <PublishArticleModal
            onSubmit={handleSubmit}
            onClose={() => {
                setModalOpen(false)
            }}
            open={modalOpen}
            mdText={mdText}
            title={title}
        />
    </>
}