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
import BlueskyLogo from "../../icons/bluesky-logo";
import {Newspaper, VisibilityOff} from "@mui/icons-material";
import {useState} from "react";
import {useSession} from "@/queries/api";
import {ViewsIcon} from "@/components/icons/views-icon";
import {post} from "@/utils/fetch";
import DeleteButton from "@/components/feed/content-options/delete-button";
import {$Typed} from "@atproto/api";
import {ArticleView, FullArticleView, PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {VersionInHistory} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {DatasetView, DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";


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



export const ContentOptions = ({
                                   onClose,
                                   record,
                                   enDiscusion,
                                   showBluesky,
                                   setShowBluesky,
                               }: {
    onClose: () => void
    record: $Typed<PostView> | $Typed<DatasetViewBasic> | $Typed<ArticleView> | $Typed<FullArticleView> | $Typed<VersionInHistory> | $Typed<DatasetView>
    enDiscusion: boolean
    showBluesky?: boolean,
    setShowBluesky?: (v: boolean) => void
}) => {
    const {user} = useSession()
    const [addedToEnDiscusion, setAddedToEnDiscusion] = useState<boolean>(enDiscusion)
    const collection = getCollectionFromUri(record.uri)
    const authorDid = getDidFromUri(record.uri)
    const inBluesky = collection == "app.bsky.feed.post"

    const isOptimistic = getRkeyFromUri(record.uri).startsWith("optimistic")

    return <div className={"flex flex-col space-y-1"}>
        {user.did == authorDid && <DeleteButton uri={record.uri} onClose={onClose}/>}
        {user.did == authorDid && canBeEnDiscusion(collection) && <OptionsDropdownButton
            handleClick={async () => {
                if (!addedToEnDiscusion) {
                    const {error} = await addToEnDiscusion(record.uri)
                    if(!error){
                        setAddedToEnDiscusion(true)
                    } else {
                        return {error}
                    }
                } else {
                    const {error} = await removeFromEnDiscusion(record.uri)
                    if(!error){
                        setAddedToEnDiscusion(false)
                    } else {
                        return {error}
                    }
                }
                // TO DO mutate("/api/feed/EnDiscusion")
                return {}
            }}
            startIcon={<Newspaper/>}
            text1={!addedToEnDiscusion ? "Agregar a En discusión" : "Retirar de En discusión"}
            disabled={isOptimistic}
        />}
        {inBluesky && <OptionsDropdownButton
            text1={"Abrir en Bluesky"}
            startIcon={<BlueskyLogo className={"w-5 h-auto"}/>}
            onClick={(e) => {
                e.stopPropagation();
                window.open(getBlueskyUrl(record.uri), "_blank")
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
        <ShareContentButton uri={record.uri}/>
    </div>
}