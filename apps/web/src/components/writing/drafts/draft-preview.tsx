import {ArticlePreviewContent} from "../../feed/article/article-preview";
import {isArticle} from "@cabildo-abierto/utils";
import {useRouter} from "next/navigation";
import {DraftPreview} from "@cabildo-abierto/api";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {TrashIcon} from "@phosphor-icons/react";
import {useState} from "react";
import {ConfirmDeleteModal} from "@/components/feed/options/options-delete-button";
import {useSession} from "@/components/auth/use-session";


const DraftPreviewComp = ({draft}: { draft: DraftPreview }) => {
    const router = useRouter()
    const [deletingDraft, setDeletingDraft] = useState(false)
    const {user} = useSession()

    function onGoToEditDraft() {
        router.push(`/escribir/articulo?i=${draft.id}`)
    }

    if (isArticle(draft.collection)) {
        return <div className={"cursor-pointer relative"}>
            <BaseIconButton
                size={"small"}
                variant={"outlined"}
                className={"absolute top-2 right-2"}
                onClick={() => {
                    setDeletingDraft(true)
                }}
            >
                <TrashIcon/>
            </BaseIconButton>
            <ArticlePreviewContent
                title={draft.title && draft.title.trim().length > 0 ? draft.title : "Sin título"}
                summary={draft.summary ?? "Sin contenido"}
                onClick={onGoToEditDraft}
                image={draft.previewImage}
            />
            <ConfirmDeleteModal
                uri={`at://${user.did}/draft/${draft.id}`}
                onClose={() => {setDeletingDraft(false)}}
                open={deletingDraft}
            />
        </div>
    } else {
        return <div className={"border rounded-lg text-[var(--text-light)] p-4"}>
            Borrador inválido
        </div>
    }
}


export default DraftPreviewComp