import {EditorState} from "lexical";
import {useRouter} from "next/navigation";
import StateButton from "../../../../modules/ui-utils/src/state-button";
import {
    editorStateToMarkdownNoEmbeds,
    editorStateToMarkdown
} from "../../../../modules/ca-lexical-editor/src/markdown-transforms";
import {post} from "@/utils/fetch";
import {useEffect, useState} from "react";
import removeMarkdown from "remove-markdown";
import {TopicMention} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import dynamic from "next/dynamic";
import {ArticleEmbedView} from "@/lex-api/types/ar/cabildoabierto/feed/article";
import {EmbedContext} from "../../../../modules/ca-lexical-editor/src/nodes/EmbedNode";
import DescriptionOnHover from "../../../../modules/ui-utils/src/description-on-hover";
import {useQueryClient} from "@tanstack/react-query";

const PublishArticleModal = dynamic(() => import('./publish-article-modal'))

export type CreateArticleProps = {
    title: string
    format: string
    text: string
    enDiscusion: boolean
    embeds?: ArticleEmbedView[]
    embedContexts?: EmbedContext[]
    draftId?: string
}

const createArticle = async (props: CreateArticleProps) => {
    return post("/article", props)
}


export function getArticleSummary(md: string){
    return removeMarkdown(md)
        .trim()
        .replaceAll("\n", " ")
        .replaceAll("\\n", " ")
        .replaceAll("\|", " ")
        .replaceAll("\-\-\-", " ")
        .slice(0, 150)
        .trim()
}


export const PublishArticleButton = ({editorState, draftId, title, disabled, modalOpen, setModalOpen, mentions}: {
    editorState: EditorState
    disabled: boolean
    title?: string
    modalOpen: boolean
    setModalOpen: (o: boolean) => void
    mentions?: TopicMention[]
    draftId?: string
}) => {
    const [mdText, setMdText] = useState("")
    const router = useRouter()
    const qc = useQueryClient()

    useEffect(() => {
        if (editorState && modalOpen) {
            const editorStateStr = JSON.stringify(editorState.toJSON())
            setMdText(editorStateToMarkdownNoEmbeds(editorStateStr))
        }
    }, [editorState, modalOpen])

    const handleSubmit = (enDiscusion: boolean) => async () => {
        const editorStateStr = JSON.stringify(editorState.toJSON())
        const {embeds, markdown, embedContexts} = editorStateToMarkdown(editorStateStr)

        const {error} = await createArticle({
            text: markdown,
            format: "markdown",
            title,
            enDiscusion,
            embeds,
            embedContexts,
            draftId
        })
        if (error) return {error}

        qc.invalidateQueries({queryKey: ["drafts"]})

        router.push("/inicio?f=siguiendo")
        return {stopResubmit: true}
    }

    let helpMsg: string

    if(disabled){
        if(!title || title.length == 0){
            helpMsg = "Agregá un título."
        } else {
            helpMsg = "El contenido no puede estar vacío."
        }
    }

    return <>
        <DescriptionOnHover description={helpMsg}>
            <StateButton
                handleClick={async () => {
                    setModalOpen(true)
                    return {}
                }}
                text1={"Publicar"}
                textClassName="whitespace-nowrap px-2 font-semibold"
                disabled={disabled}
                color={"background"}
                size="medium"
                variant={"text"}
                sx={{borderRadius: 20}}
            />
        </DescriptionOnHover>
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