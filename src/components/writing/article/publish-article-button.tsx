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
import {TopicMention} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {TopicsMentioned} from "@/components/article/topics-mentioned";
import Link from "next/link";
import {topicUrl} from "@/utils/uri";

const createArticle = async (text: string, format: string, title: string, enDiscusion: boolean) => {
    return post("/article", {
        text, format, title, enDiscusion
    })
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
        textColor={enDiscusion ? "text" : "text-lighter"}
        title={'Agregar al feed "En discusión"'}
    >
        <Newspaper color={"inherit"}/>
    </IconButton>
}

type PublishArticleModalProps = {
    open: boolean
    onClose: () => void
    onSubmit: (enDiscusion: boolean) => StateButtonClickHandler
    mdText?: string
    title?: string
    mentions?: TopicMention[]
}

const PublishArticleModal = ({onSubmit, open, onClose, mdText, title, mentions}: PublishArticleModalProps) => {
    const [enDiscusion, setEnDiscusion] = useState(true)

    const summary = markdownToPlainText(mdText)
        .slice(0, 150)
        .replaceAll("\n", " ")


    return <BaseFullscreenPopup open={open} onClose={onClose} closeButton={true}>
        <div className={"pb-8 w-[500px] min-h-[300px] px-6 flex flex-col justify-between space-y-8"}>
            <h3 className={"text-center"}>
                ¿Listo para publicar?
            </h3>

            <div className={"space-y-2"}>
                <div className={"w-full flex flex-col"}>
                    <div className={"text-sm text-[var(--text-light)] px-1"}>
                        Así se va a ver en el muro:
                    </div>
                    <ArticlePreviewContent
                        color="background-dark2"
                        clickable={false}
                        title={title}
                        summary={summary}
                        mentions={mentions}
                    />
                </div>

                {mentions.length > 1 && <div className={"w-full flex flex-col"}>
                    <div className={"text-sm text-[var(--text-light)] px-1"}>
                        También va a aparecer en los temas: {
                        mentions.map((m, i) =>
                            <Link
                                className={"hover:text-[var(--text)]"}
                                key={i}
                                href={topicUrl(m.id)}
                            >{m.title}{i < mentions.length - 1 ? ", " : ""}
                            </Link>)}.
                    </div>
                </div>}
            </div>
            {mentions.length == 1 && <div className={"w-full flex flex-col"}>
                <div className={"text-sm text-[var(--text-light)] px-1"}>
                    También va a aparecer en el tema {mentions[0].title}.
                </div>
            </div>}

            <div className={"flex justify-between w-full"}>
                <AddToEnDiscusionButton enDiscusion={enDiscusion} setEnDiscusion={setEnDiscusion}/>
                <StateButton
                    text1={"Publicar"}
                    handleClick={onSubmit(enDiscusion)}
                />
            </div>
        </div>
    </BaseFullscreenPopup>
}


export const PublishArticleButton = ({editorState, title, disabled, modalOpen, setModalOpen, mentions}: {
    editorState: EditorState
    disabled: boolean
    title?: string
    modalOpen: boolean
    setModalOpen: (o: boolean) => void
    mentions?: TopicMention[]
}) => {
    const [mdText, setMdText] = useState("")
    const router = useRouter()

    useEffect(() => {
        if (editorState && modalOpen) {
            const editorStateStr = JSON.stringify(editorState.toJSON())
            setMdText(editorStateToMarkdown(editorStateStr))
        }
    }, [editorState, modalOpen])

    const handleSubmit = (enDiscusion: boolean) => async () => {
        const {error} = await createArticle(mdText, "markdown", title, enDiscusion, )
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
            mentions={mentions}
        />
    </>
}