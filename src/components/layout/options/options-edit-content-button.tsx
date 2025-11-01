import {WriteButtonIcon} from "@/components/layout/icons/write-button-icon";
import {getRkeyFromUri, isArticle, isPost, splitUri} from "@/utils/uri";
import {useSession} from "@/queries/getters/useSession";
import {useRouter} from "next/navigation";
import {
    ArCabildoabiertoDataDataset,
    ArCabildoabiertoFeedDefs,
    ArCabildoabiertoWikiTopicVersion
} from "@/lex-api"

import {$Typed} from "@/lex-api/util";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu";



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

    return <DropdownMenuItem onClick={onClickEdit}>
        <div>
            <WriteButtonIcon fontSize={20}/>
        </div>
        <div>
            Editar
        </div>
    </DropdownMenuItem>
}