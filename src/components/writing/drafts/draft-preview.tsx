import {DraftPreview} from "@/queries/getters/useDrafts";
import {ArticlePreviewContent} from "@/components/feed/article/article-preview";
import {isArticle} from "@/utils/uri";
import {useRouter} from "next/navigation";


const DraftPreviewComp = ({draft}: { draft: DraftPreview }) => {
    const router = useRouter()

    function onGoToEditDraft() {
        router.push(`/escribir/articulo?i=${draft.id}`)
    }

    if (isArticle(draft.collection)) {
        return <div className={"cursor-pointer"} onClick={onGoToEditDraft}>
            <ArticlePreviewContent
                title={draft.title && draft.title.trim().length > 0 ? draft.title : "Sin título"}
                summary={draft.summary ?? "Sin contenido"}
                color={"transparent"}
                clickable={true}
            />
        </div>
    } else {
        return <div className={"border rounded-lg text-[var(--text-light)] p-4"}>
            Borrador inválido
        </div>
    }
}


export default DraftPreviewComp