import {EditorState} from "lexical";
import {useRouter} from "next/navigation";
import StateButton from "../../../../modules/ui-utils/src/state-button";
import {editorStateToMarkdown} from "../../../../modules/ca-lexical-editor/src/markdown-transforms";
import {post} from "@/utils/fetch";
import {useEffect, useState} from "react";
import removeMarkdown from "remove-markdown";
import {TopicMention} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import dynamic from "next/dynamic";

const PublishArticleModal = dynamic(() => import('./publish-article-modal'))

const createArticle = async (text: string, format: string, title: string, enDiscusion: boolean) => {
    return post("/article", {
        text, format, title, enDiscusion
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