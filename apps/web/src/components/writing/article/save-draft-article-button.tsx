import {StateButton} from "@/components/utils/base/state-button"
import {EditorState} from "lexical";
import {post} from "@/components/utils/react/fetch";
import {useQueryClient} from "@tanstack/react-query";
import {ArCabildoabiertoFeedArticle} from "@cabildo-abierto/api"
import {EmbedContext} from "@/components/editor/nodes/EmbedNode";
import {updateSearchParam} from "@/components/utils/react/search-params";
import {toast} from "sonner";


type CreateDraftParams = {
    id?: string
    collection: "ar.cabildoabierto.feed.article" | "app.bsky.feed.post"
    text: string
    title: string
    embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
    embedContexts?: EmbedContext[]
}

export const SaveDraftArticleButton = ({title, draftId, editorState, disabled, onSavedChanges}: {
    disabled: boolean
    title: string
    editorState: EditorState
    draftId: string | null
    onSavedChanges: (time: Date, draftId: string, state: string) => void
}) => {
    const qc = useQueryClient()

    async function onSaveDraft() {
        const { editorStateToMarkdown } = await import("../../editor/markdown-transforms");

        const markdown = editorStateToMarkdown(editorState.toJSON())

        const saveTime = new Date()
        const {error, data} = await post<CreateDraftParams, {id: string}>("/draft", {
            id: draftId ?? undefined,
            collection: "ar.cabildoabierto.feed.article",
            text: markdown.markdown,
            embeds: markdown.embeds,
            embedContexts: markdown.embedContexts,
            title: title
        })
        if(data && data.id && !error){
            const state = JSON.stringify(editorState.toJSON())+`::${title}`
            onSavedChanges(saveTime, data.id, state)
            updateSearchParam("i", data.id)
            await qc.cancelQueries({ queryKey: ["drafts"] })
            await qc.cancelQueries({ queryKey: ["draft", data.id] })
            await qc.invalidateQueries({ queryKey: ["draft", data.id] })
            await qc.invalidateQueries({ queryKey: ["drafts"] })
            toast.success('Se guardó el borrador en Tus papeles')
        }
        return {error}
    }

    return <StateButton
        handleClick={onSaveDraft}
        disabled={disabled}
    >
        Guardar borrador
    </StateButton>
}