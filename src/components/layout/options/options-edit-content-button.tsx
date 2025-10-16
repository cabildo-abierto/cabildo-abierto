import {OptionsDropdownButton} from "@/components/layout/options/options-dropdown-button";
import {WriteButtonIcon} from "@/components/layout/icons/write-button-icon";
import {getRkeyFromUri, isArticle, isPost, splitUri} from "@/utils/uri";
import {useSession} from "@/queries/getters/useSession";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {ArCabildoabiertoDataDataset, ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion} from "@/lex-api"
import dynamic from "next/dynamic";
import {$Typed} from "@/lex-api/util";
const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'), {ssr: false})


export const OptionsEditContentButton = ({record}: { record: $Typed<ArCabildoabiertoFeedDefs.PostView> |
        $Typed<ArCabildoabiertoDataDataset.DatasetViewBasic> |
        $Typed<ArCabildoabiertoFeedDefs.ArticleView> |
        $Typed<ArCabildoabiertoFeedDefs.FullArticleView> |
        $Typed<ArCabildoabiertoWikiTopicVersion.VersionInHistory> |
        $Typed<ArCabildoabiertoDataDataset.DatasetView> }) => {
    const [editingPost, setEditingPost] = useState(false)
    const {did: authorDid, collection} = splitUri(record.uri)
    const {user} = useSession()
    const isAuthor = user && user.did == authorDid
    const router = useRouter()

    let canBeEdited = isArticle(collection) || isPost(collection)

    async function onClickEdit() {
        if (isArticle(collection)) {
            router.push(`/escribir/articulo?r=${getRkeyFromUri(record.uri)}`)
        } else if (isPost(collection)) {
            if (!editingPost) setEditingPost(true)
        }
        return {}
    }


    return isAuthor && canBeEdited && <>
        <OptionsDropdownButton
            text1={"Editar"}
            startIcon={<WriteButtonIcon/>}
            handleClick={onClickEdit}
        />
        {editingPost && ArCabildoabiertoFeedDefs.isPostView(record) && <WritePanel
            open={editingPost}
            onClose={() => {
                setEditingPost(false)
            }}
            postView={record}
        />}
    </>
}