import {ATProtoStrongRef} from "@/lib/types";
import {ShareContentButton} from "./share-content-button";
import {getBlueskyUrl, getCollectionFromUri, getDidFromUri, isArticle, isPost, splitUri} from "@/utils/uri";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {OptionsDropdownButton} from "./options-dropdown-button";
import {BlueskyLogo} from "../../icons/bluesky-logo";
import {Newspaper, VisibilityOff} from "@mui/icons-material";
import {useState} from "react";
import {useSession} from "@/hooks/api";
import {ViewsIcon} from "@/components/icons/views-icon";
import {post} from "@/utils/fetch";


const collection2displayText = {
    "ar.com.cabildoabierto.visualization": "visualización",
    "app.bsky.feed.post": "post",
    "ar.com.cabildoabierto.article": "artículo",
    "ar.com.cabildoabierto.quotePost": "respuesta",
    "ar.com.cabildoabierto.topic": "versión",
    "ar.cabildoabierto.wiki.topicVersion": "versión",
    "ar.com.cabildoabierto.dataset": "conjunto de datos",
    "ar.cabildoabierto.feed.article": "artículo"
}


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


const deleteRecord = async ({uri, atproto}: { uri: string, atproto: boolean }) => {
    return post("/delete-record", {uri, atproto})
}


export const ContentOptions = ({
                                   onClose,
                                   record,
                                   enDiscusion,
                                   showBluesky,
                                   setShowBluesky,
                               }: {
    onClose: () => void
    record: ATProtoStrongRef
    onDelete?: () => Promise<void>
    enDiscusion: boolean
    showBluesky?: boolean,
    setShowBluesky?: (v: boolean) => void
}) => {
    const {user} = useSession()
    const [addedToEnDiscusion, setAddedToEnDiscusion] = useState<boolean>(enDiscusion)

    async function onClickDelete() {
        const {error} = await deleteRecord({uri: record.uri, atproto: true})
        if (!error) {
            onClose()
        }
        return {error}
    }

    const collection = getCollectionFromUri(record.uri)
    const authorDid = getDidFromUri(record.uri)
    const inBluesky = collection == "app.bsky.feed.post"

    return <div className={"flex flex-col space-y-1"}>
        {user.did == authorDid && <OptionsDropdownButton
            handleClick={onClickDelete}
            startIcon={<DeleteOutlineIcon/>}
            text1={"Borrar " + collection2displayText[collection]}
        />}
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
        />}
        {inBluesky && <OptionsDropdownButton
            text1={"Abrir en Bluesky"}
            startIcon={<BlueskyLogo/>}
            onClick={(e) => {
                e.stopPropagation();
                window.open(getBlueskyUrl(record.uri), "_blank")
            }}
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