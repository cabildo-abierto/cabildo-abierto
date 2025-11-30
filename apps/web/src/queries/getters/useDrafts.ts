import {useAPI} from "@/components/utils/react/queries";
import {Draft, DraftPreview} from "@cabildo-abierto/api";


export function useDrafts() {
    return useAPI<DraftPreview[]>("/drafts", ["drafts"])
}


export function useDraft(id: string) {
    return useAPI<Draft>(`/draft/${id}`, ["draft", id])
}
