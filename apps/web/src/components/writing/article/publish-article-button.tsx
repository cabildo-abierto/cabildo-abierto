import {EditorState} from "lexical";
import {useRouter} from "next/navigation";
import {post} from "../../utils/react/fetch";
import {useEffect, useState} from "react";
import {StateButton} from "@/components/utils/base/state-button"
import {DescriptionOnHover} from "@/components/utils/base/description-on-hover";
import dynamic from "next/dynamic";
import {useQueryClient} from "@tanstack/react-query";
import {ArCabildoabiertoFeedArticle, ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {threadQueryKey} from "@/queries/getters/useThread";
import {EmbedContext} from "@/components/editor/nodes/EmbedNode";
import {contentUrl} from "@/components/utils/react/url";

const PublishArticleModal = dynamic(() => import('./publish-article-modal'))

export type CreateArticleProps = {
    title: string
    format: string
    text: string
    enDiscusion: boolean
    embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
    embedContexts?: EmbedContext[]
    draftId?: string
    uri?: string
}

const createArticle = async (props: CreateArticleProps) => {
    return post("/article", props)
}


export const PublishArticleButton = ({editorState, article, guardEnabled, setGuardEnabled, draftId, title, disabled, modalOpen, setModalOpen, mentions}: {
    editorState: EditorState
    disabled: boolean
    title?: string
    modalOpen: boolean
    setModalOpen: (o: boolean) => void
    mentions?: ArCabildoabiertoFeedDefs.TopicMention[]
    draftId?: string
    guardEnabled: boolean
    setGuardEnabled: (s: boolean) => void,
    article?: ArCabildoabiertoFeedDefs.FullArticleView
}) => {
    const [mdText, setMdText] = useState("")
    const router = useRouter()
    const qc = useQueryClient()
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        if(saved && !guardEnabled){
            if(!article) {
                router.push("/inicio?f=siguiendo")
            } else {
                router.push(contentUrl(article.uri))
            }
        }
    }, [guardEnabled, saved])

    const handleSubmit = (enDiscusion: boolean) => async () => {

        const editorStateStr = JSON.stringify(editorState.toJSON())
        const { editorStateToMarkdown } = await import("../../editor/markdown-transforms");
        const {embeds, markdown, embedContexts} = editorStateToMarkdown(editorStateStr)

        const {error} = await createArticle({
            text: markdown,
            format: "markdown",
            title,
            enDiscusion,
            embeds,
            embedContexts,
            draftId,
            uri: article?.uri
        })
        if (error) return {error}

        qc.invalidateQueries({queryKey: ["session"]})
        qc.invalidateQueries({queryKey: ["drafts"]})
        qc.invalidateQueries({
            predicate: query => {
                return query.queryKey.length == 3 && query.queryKey[0] == "profile-feed" && query.queryKey[2] == "articles"
            }
        })
        if(article) {
            qc.invalidateQueries({queryKey: threadQueryKey(article.uri)})
        }

        setGuardEnabled(false)
        setSaved(true)
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
                    const { editorStateToMarkdownNoEmbeds } = await import("../../editor/markdown-transforms");
                    const editorStateStr = JSON.stringify(editorState.toJSON())
                    const mdText = editorStateToMarkdownNoEmbeds(editorStateStr)
                    setMdText(mdText)
                    setModalOpen(true)
                    return {}
                }}
                disabled={disabled}
            >
                {!article ? "Publicar" : "Guardar edición"}
            </StateButton>
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
            article={article}
        />}
    </>
}