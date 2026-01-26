import {StateButton} from "@/components/utils/base/state-button"
import {EditorState} from "lexical";
import {post} from "@/components/utils/react/fetch";
import {useQueryClient} from "@tanstack/react-query";
import {updateSearchParam} from "@/components/utils/react/search-params";
import {toast} from "sonner";
import {ImagePayload} from "@cabildo-abierto/api";
import {CreateDraftParams} from "@cabildo-abierto/api";


export const SaveDraftArticleButton = ({
                                           title,
                                           draftId,
                                           editorState,
                                           disabled,
                                           onSavedChanges,
                                           description,
                                           previewImage
                                       }: {
    disabled: boolean
    title: string
    editorState: EditorState
    description: string | null
    previewImage: ImagePayload | null
    draftId: string | null
    onSavedChanges: (time: Date, draftId: string, state: string) => void
}) => {
    const qc = useQueryClient()

    async function onSaveDraft() {
        const {editorStateToMarkdown} = await import("../../editor/markdown-transforms");

        const markdown = editorStateToMarkdown(editorState.toJSON())

        const saveTime = new Date()
        const {error, data} = await post<CreateDraftParams, { id: string }>("/draft", {
            id: draftId ?? undefined,
            collection: "ar.cabildoabierto.feed.article",
            text: markdown.markdown,
            embeds: markdown.embeds,
            embedContexts: markdown.embedContexts,
            title: title,
            description,
            previewImage
        })
        console.log("draft creation", error, data)
        if (data && data.id && !error) {
            const state = JSON.stringify(editorState.toJSON()) + `::${title}`
            onSavedChanges(saveTime, data.id, state)
            updateSearchParam("i", data.id)
            await qc.cancelQueries({queryKey: ["drafts"]})
            await qc.cancelQueries({queryKey: ["draft", data.id]})
            await qc.invalidateQueries({queryKey: ["draft", data.id]})
            await qc.invalidateQueries({queryKey: ["drafts"]})
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