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
import {ArticleEmbed} from "@/lex-api/types/ar/cabildoabierto/feed/article";

const PublishArticleModal = dynamic(() => import('./publish-article-modal'))

const createArticle = async (text: string, format: string, title: string, enDiscusion: boolean, embeds: ArticleEmbed[]) => {
    return post("/article", {
        text, format, title, enDiscusion, embeds
    })
}

export function markdownToPlainText(md: string) {
    return removeMarkdown(md).replace(/\n{2,}/g, '\n').trim()
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
            setMdText(editorStateToMarkdownNoEmbeds(editorStateStr))
        }
    }, [editorState, modalOpen])

    const handleSubmit = (enDiscusion: boolean) => async () => {
        const editorStateStr = JSON.stringify(editorState.toJSON())
        const {embeds, markdown} = editorStateToMarkdown(editorStateStr)

        const {error} = await createArticle(markdown, "markdown", title, enDiscusion, embeds)
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