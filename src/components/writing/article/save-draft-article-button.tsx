import StateButton from "../../../../modules/ui-utils/src/state-button";
import {EditorState} from "lexical";
import {post, updateSearchParam} from "@/utils/fetch";
import {editorStateToMarkdown} from "../../../../modules/ca-lexical-editor/src/markdown-transforms";
import {ArticleEmbedView} from "@/lex-api/types/ar/cabildoabierto/feed/article";
import {EmbedContext} from "../../../../modules/ca-lexical-editor/src/nodes/EmbedNode";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {prettyPrintJSON} from "@/utils/strings";

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

    async function saveDraft(params: CreateDraftParams): Promise<{error: string}> {
        const saveTime = new Date()
        const {error, data} = await post<CreateDraftParams, {id: string}>("/draft", params)
        if(data && data.id && !error){
            onSavedChanges(saveTime, data.id)
            updateSearchParam("i", data.id)
        }
        return {error}
    }

    const saveDraftMutation = useMutation<
        { error: string },
        unknown,
        CreateDraftParams
    >({
        mutationFn: saveDraft,
        onSuccess: async () => {
            await qc.cancelQueries({ queryKey: ["drafts"] })
            await qc.invalidateQueries({ queryKey: ["drafts"] })
        }
    })

    async function onSaveDraft() {
        const markdown = editorStateToMarkdown(editorState.toJSON())

        prettyPrintJSON(markdown.embeds)
        prettyPrintJSON(markdown.embedContexts)
        const {error} = await saveDraftMutation.mutateAsync({
            id: draftId ?? undefined,
            collection: "ar.cabildoabierto.feed.article",
            text: markdown.markdown,
            embeds: markdown.embeds,
            embedContexts: markdown.embedContexts,
            title: title
        })
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