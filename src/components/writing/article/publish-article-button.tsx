import {EditorState} from "lexical";
import {useRouter} from "next/navigation";
import {post} from "@/utils/fetch";
import {useState} from "react";
import StateButton from "../../../../modules/ui-utils/src/state-button";
import DescriptionOnHover from "../../../../modules/ui-utils/src/description-on-hover";
import dynamic from "next/dynamic";
import {EmbedContext} from "../../../../modules/ca-lexical-editor/src/nodes/EmbedNode";
import {useQueryClient} from "@tanstack/react-query";
import {ArCabildoabiertoFeedArticle, ArCabildoabiertoFeedDefs} from "@/lex-api/index"

const PublishArticleModal = dynamic(() => import('./publish-article-modal'))

export type CreateArticleProps = {
    title: string
    format: string
    text: string
    enDiscusion: boolean
    embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
    embedContexts?: EmbedContext[]
    draftId?: string
}

const createArticle = async (props: CreateArticleProps) => {
    return post("/article", props)
}


export const PublishArticleButton = ({editorState, draftId, title, disabled, modalOpen, setModalOpen, mentions}: {
    editorState: EditorState
    disabled: boolean
    title?: string
    modalOpen: boolean
    setModalOpen: (o: boolean) => void
    mentions?: ArCabildoabiertoFeedDefs.TopicMention[]
    draftId?: string
}) => {
    const [mdText, setMdText] = useState("")
    const router = useRouter()
    const qc = useQueryClient()

    const handleSubmit = (enDiscusion: boolean) => async () => {
        const editorStateStr = JSON.stringify(editorState.toJSON())
        const { editorStateToMarkdown } = await import("../../../../modules/ca-lexical-editor/src/markdown-transforms");
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

        qc.invalidateQueries({queryKey: ["session"]})
        qc.invalidateQueries({queryKey: ["drafts"]})
        qc.invalidateQueries({
            predicate: query => {
                return query.queryKey.length == 3 && query.queryKey[0] == "profile-feed" && query.queryKey[2] == "articles"
            }
        })

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
                    const { editorStateToMarkdownNoEmbeds } = await import("../../../../modules/ca-lexical-editor/src/markdown-transforms");
                    const editorStateStr = JSON.stringify(editorState.toJSON())
                    const mdText = editorStateToMarkdownNoEmbeds(editorStateStr)
                    setMdText(mdText)
                    setModalOpen(true)
                    return {}
                }}
                text1={"Publicar"}
                textClassName="whitespace-nowrap px-2 font-semibold text-[13px]"
                disabled={disabled}
                color={"background"}
                size="medium"
                variant={"text"}
            />
        </DescriptionOnHover>
        {modalOpen && <PublishArticleModal
            onSubmit={handleSubmit}
            onClose={async () => {
                setModalOpen(false)
            }}
            open={modalOpen}
            mdText={mdText}
            title={title}
            mentions={mentions}
        />}
    </>
}