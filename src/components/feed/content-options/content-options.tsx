import {ShareContentButton} from "./share-content-button";
import {
    getBlueskyUrl,
    getCollectionFromUri,
    getDidFromUri,
    getRkeyFromUri,
    isArticle,
    isPost,
    splitUri
} from "@/utils/uri";
import {OptionsDropdownButton} from "./options-dropdown-button";
import BlueskyLogo from "@/components/layout/icons/bluesky-logo";
import {Newspaper, VisibilityOff} from "@mui/icons-material";
import {useState} from "react";
import {useSession} from "@/queries/getters/useSession";
import {ViewsIcon} from "@/components/layout/icons/views-icon";
import {post} from "@/utils/fetch";
import DeleteButton from "@/components/feed/content-options/delete-button";
import {$Typed} from "@/lex-api/util";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion, ArCabildoabiertoDataDataset} from "@/lex-api/index"
import {QueryClient, useQueryClient} from "@tanstack/react-query";
import {QueryContentUpdater, updateContentInQueries} from "@/queries/mutations/updates";
import {WriteButtonIcon} from "@/components/layout/icons/write-button-icon";
import {useRouter} from "next/navigation";
import dynamic from "next/dynamic";

const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'), {ssr: false})

export function canBeEnDiscusion(c: string) {
    return isPost(c) || isArticle(c)
}


const addToEnDiscusion = async (uri: string) => {
    const {collection, rkey} = splitUri(uri)
    return await post(`/set-en-discusion/${collection}/${rkey}`)
}


const removeFromEnDiscusion = async (uri: string) => {
    const {collection, rkey} = splitUri(uri)
    return await post(`/unset-en-discusion/${collection}/${rkey}`)
}



function optimisticRemoveContentFromEnDiscusion(uri: string, qc: QueryClient) {
    const updater: QueryContentUpdater<ArCabildoabiertoFeedDefs.FeedViewContent["content"]> = p => null
    updateContentInQueries(qc, uri, updater, qc => qc[0] == "main-feed" && qc[1] == "discusion")
}



export const ContentOptions = ({
                                   onClose,
                                   record,
                                   enDiscusion,
                                   showBluesky,
                                   setShowBluesky,
                               }: {
    onClose: () => void
    record: $Typed<ArCabildoabiertoFeedDefs.PostView> |
        $Typed<ArCabildoabiertoDataDataset.DatasetViewBasic> |
        $Typed<ArCabildoabiertoFeedDefs.ArticleView> |
        $Typed<ArCabildoabiertoFeedDefs.FullArticleView> |
        $Typed<ArCabildoabiertoWikiTopicVersion.VersionInHistory> |
        $Typed<ArCabildoabiertoDataDataset.DatasetView>
    enDiscusion: boolean
    showBluesky?: boolean,
    setShowBluesky?: (v: boolean) => void
}) => {
    const {user} = useSession()
    const [addedToEnDiscusion, setAddedToEnDiscusion] = useState<boolean>(enDiscusion)
    const collection = getCollectionFromUri(record.uri)
    const authorDid = getDidFromUri(record.uri)
    const inBluesky = collection == "app.bsky.feed.post"
    const qc = useQueryClient()
    const router = useRouter()
    const [editingPost, setEditingPost] = useState(false)

    const isOptimistic = getRkeyFromUri(record.uri).startsWith("optimistic")

    const isAuthor = user && user.did == authorDid

    async function onClickEdit() {
        if(isArticle(collection)){
            router.push(`/escribir/articulo?r=${getRkeyFromUri(record.uri)}`)
        } else if(isPost(collection)) {
            if(!editingPost) setEditingPost(true)
        }
        return {}
    }

    let canBeEdited = false

    if(ArCabildoabiertoFeedDefs.isPostView(record) ||
        ArCabildoabiertoFeedDefs.isFullArticleView(record) ||
        ArCabildoabiertoFeedDefs.isArticleView(record)
    ) {
        canBeEdited = !(record.bskyRepostCount || record.repostCount || record.quoteCount || record.bskyQuoteCount || record.bskyLikeCount || record.likeCount || record.replyCount);
    }

    canBeEdited = true

    return <div className={"flex flex-col space-y-1"}>
        {isAuthor && <DeleteButton uri={record.uri} onClose={onClose}/>}
        {isAuthor && canBeEnDiscusion(collection) && <OptionsDropdownButton
            handleClick={async () => {
                if (!addedToEnDiscusion) {
                    const {error} = await addToEnDiscusion(record.uri)
                    if(!error){
                        setAddedToEnDiscusion(true)
                    } else {
                        return {error}
                    }
                } else {
                    optimisticRemoveContentFromEnDiscusion(record.uri, qc)
                    const {error} = await removeFromEnDiscusion(record.uri)
                    if(!error){
                        setAddedToEnDiscusion(false)
                    } else {
                        return {error}
                    }
                }
                return {}
            }}
            startIcon={<Newspaper/>}
            text1={!addedToEnDiscusion ? "Agregar a En discusión" : "Retirar de En discusión"}
            disabled={isOptimistic}
        />}
        {isAuthor && canBeEdited && <OptionsDropdownButton
            text1={"Editar"}
            startIcon={<WriteButtonIcon/>}
            handleClick={onClickEdit}
        />}
        {inBluesky && <OptionsDropdownButton
            text1={"Abrir en Bluesky"}
            startIcon={<BlueskyLogo className={"w-5 h-auto"}/>}
            handleClick={async () => {
                window.open(getBlueskyUrl(record.uri), "_blank")
                return {}
            }}
            disabled={isOptimistic}
        />}
        {setShowBluesky &&
            <OptionsDropdownButton
                text1={"Reacciones en Bluesky"}
                handleClick={async () => {setShowBluesky(!showBluesky); return {}}}
                startIcon={!showBluesky ? <ViewsIcon/> : <VisibilityOff/>}
            />
        }
        <ShareContentButton uri={record.uri} handle={record.author.handle}/>
        {editingPost && ArCabildoabiertoFeedDefs.isPostView(record) && <WritePanel
            open={editingPost}
            onClose={() => {setEditingPost(false)}}
            postView={record}
        />}
    </div>
}