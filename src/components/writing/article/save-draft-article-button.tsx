import StateButton from "../../../../modules/ui-utils/src/state-button";
import {EditorState} from "lexical";
import {post, updateSearchParam} from "@/utils/fetch";
import {editorStateToMarkdown} from "../../../../modules/ca-lexical-editor/src/markdown-transforms";
import {ArticleEmbedView} from "@/lex-api/types/ar/cabildoabierto/feed/article";
import {EmbedContext} from "../../../../modules/ca-lexical-editor/src/nodes/EmbedNode";
import {useQueryClient} from "@tanstack/react-query";

type CreateDraftParams = {
    id?: string
    collection: "ar.cabildoabierto.feed.article" | "app.bsky.feed.post"
    text: string
    title: string
    embeds?: ArticleEmbedView[]
    embedContexts?: EmbedContext[]
}

export const SaveDraftArticleButton = ({title, draftId, editorState, disabled, onSavedChanges}: {
    disabled: boolean
    title: string
    editorState: EditorState
    draftId: string | null
    onSavedChanges: (time: Date, draftId: string) => void
}) => {
    const qc = useQueryClient()

    async function onSaveDraft() {
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
            onSavedChanges(saveTime, data.id)
            updateSearchParam("i", data.id)
            await qc.cancelQueries({ queryKey: ["drafts"] })
            await qc.cancelQueries({ queryKey: ["draft", data.id] })
            await qc.invalidateQueries({ queryKey: ["draft", data.id] })
            await qc.invalidateQueries({ queryKey: ["drafts"] })
        }
        return {error}
    }

    return <StateButton
        handleClick={onSaveDraft}
        text1={"Guardar borrador"}
        textClassName="whitespace-nowrap px-2 font-semibold"
        disabled={disabled}
        color={"background"}
        size="medium"
        variant={"text"}
        sx={{borderRadius: 20}}
    />
}