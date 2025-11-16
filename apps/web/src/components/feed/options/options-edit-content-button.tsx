import {WriteButtonIcon} from "@/components/utils/icons/write-button-icon";
import {getRkeyFromUri, isArticle, isPost, splitUri} from "@cabildo-abierto/utils/dist/uri";
import {useRouter} from "next/navigation";
import {
    ArCabildoabiertoDataDataset,
    ArCabildoabiertoFeedDefs,
    ArCabildoabiertoWikiTopicVersion
} from "@cabildo-abierto/api"
import {$Typed} from "@cabildo-abierto/api";
import {useSession} from "@/components/auth/use-session";
import { DropdownMenuItem } from "@/components/utils/ui/dropdown-menu";


export const OptionsEditContentButton = ({
                                             record, setEditingPost}: {
    record: $Typed<ArCabildoabiertoFeedDefs.PostView> |
        $Typed<ArCabildoabiertoDataDataset.DatasetViewBasic> |
        $Typed<ArCabildoabiertoFeedDefs.ArticleView> |
        $Typed<ArCabildoabiertoFeedDefs.FullArticleView> |
        $Typed<ArCabildoabiertoWikiTopicVersion.VersionInHistory> |
        $Typed<ArCabildoabiertoDataDataset.DatasetView>
    setEditingPost: (v: boolean) => void
}) => {
    const {did: authorDid, collection} = splitUri(record.uri)
    const {user} = useSession()
    const isAuthor = user && user.did == authorDid
    const router = useRouter()

    let canBeEdited = isArticle(collection) || isPost(collection)

    async function onClickEdit() {
        if (isArticle(collection)) {
            router.push(`/escribir/articulo?r=${getRkeyFromUri(record.uri)}`)
        } else if (isPost(collection)) {
            setEditingPost(true)
        }
        return {}
    }

    if (!isAuthor || !canBeEdited) return null

    return <DropdownMenuItem
        onClick={onClickEdit}
    >
        <div>
            <WriteButtonIcon fontSize={20}/>
        </div>
        <div>
            Editar
        </div>
    </DropdownMenuItem>
}