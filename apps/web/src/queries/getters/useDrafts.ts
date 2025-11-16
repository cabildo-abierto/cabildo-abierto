import {useAPI} from "@/components/utils/react/queries";
import {ArCabildoabiertoFeedArticle} from "@cabildo-abierto/api"

export type DraftPreview = {
    summary: string
    collection: string
    createdAt: Date
    lastUpdate: Date
    id: string
    title?: string
}


export type Draft = {
    text: string
    summary: string
    embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
    collection: string
    createdAt: Date
    lastUpdate: Date
    id: string
    title?: string
}


export function useDrafts() {
    return useAPI<DraftPreview[]>("/drafts", ["drafts"])
}


export function useDraft(id: string) {
    return useAPI<Draft>(`/draft/${id}`, ["draft", id])
}
