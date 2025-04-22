import {ATProtoStrongRef, VisualizationProps} from "@/lib/types";
import Link from "next/link";
import {ShareContentButton} from "./share-content-button";
import {editVisualizationUrl, getBlueskyUrl, getCollectionFromUri, getDidFromUri, isArticle, isPost} from "@/utils/uri";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {OptionsDropdownButton} from "./options-dropdown-button";
import {BlueskyLogo} from "../../icons/bluesky-logo";
import {Newspaper} from "@mui/icons-material";
import {useSWRConfig} from "swr";
import {useState} from "react";
import {useSession} from "@/hooks/swr";


const collection2displayText = {
    "ar.com.cabildoabierto.visualization": "visualización",
    "app.bsky.feed.post": "post",
    "ar.com.cabildoabierto.article": "artículo",
    "ar.com.cabildoabierto.quotePost": "respuesta",
    "ar.com.cabildoabierto.topic": "versión",
    "ar.com.cabildoabierto.dataset": "conjunto de datos",
    "ar.cabildoabierto.feed.article": "artículo"
}

export const openJsonInNewTab = (json: any) => {
    const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
}


export function canBeEnDiscusion(c: string){
    return isPost(c) || isArticle(c)
}


const addToEnDiscusion = async (uri: string) => {
    return
}


const removeFromEnDiscusion = async (uri: string) => {
    return
}


const deleteRecords = async ({uris, atproto}: {uris: string[], atproto: boolean}) => {

}


export const ContentOptions = ({onClose, record, onDelete, enDiscusion}: {
    onClose: () => void
    record: ATProtoStrongRef
    onDelete?: () => Promise<void>
    enDiscusion: boolean
}) => {
    const {user} = useSession()
    const {mutate} = useSWRConfig()
    const [addedToEnDiscusion, setAddedToEnDiscusion] = useState<boolean>(enDiscusion)

    async function onClickDelete() {
        await deleteRecords({uris: [record.uri], atproto: true})
        await onDelete()
    }

    const collection = getCollectionFromUri(record.uri)
    const authorDid = getDidFromUri(record.uri)
    const inBluesky = collection == "app.bsky.feed.post"

    return <div className={"flex flex-col space-y-1"}>
        {user.did == authorDid && <OptionsDropdownButton
            handleClick={async () => {await onClickDelete(); onClose(); return {}}}
            startIcon={<DeleteOutlineIcon/>}
            text1={"Borrar " + collection2displayText[collection]}
        />}
        {user.did == authorDid && canBeEnDiscusion(collection) && <OptionsDropdownButton
            handleClick={async () => {
                if(!addedToEnDiscusion){
                    await addToEnDiscusion(record.uri)
                    setAddedToEnDiscusion(true)
                } else {
                    await removeFromEnDiscusion(record.uri)
                    setAddedToEnDiscusion(false)
                }
                mutate("/api/feed/EnDiscusion")
                return {}
            }}
            startIcon={<Newspaper/>}
            text1={!addedToEnDiscusion ? "Agregar a En discusión" : "Retirar de En discusión"}
        />}
        {inBluesky && <OptionsDropdownButton
            text1={"Ver en Bluesky"}
            startIcon={<BlueskyLogo/>}
            onClick={(e) => {e.stopPropagation(); window.open(getBlueskyUrl(record.uri), "_blank")}}
        />}
        {collection == "ar.com.cabildoabierto.dataset" && <Link
            href={editVisualizationUrl(record.uri)}
            onClick={(e) => {e.stopPropagation()}}
        >
            <OptionsDropdownButton
                text1={"Usar en visualización"}
            />
        </Link>}
        {collection == "ar.com.cabildoabierto.visualization" &&
            <OptionsDropdownButton
                handleClick={async () => {openJsonInNewTab(JSON.parse((record as VisualizationProps).visualization.spec)); return {}}}
                text1={"Ver especificación"}
            />
        }
        {collection == "ar.com.cabildoabierto.visualization" &&
            <Link href={editVisualizationUrl(record.uri)} onClick={(e) => {e.stopPropagation()}}>
                <OptionsDropdownButton
                    text1={"Editar"}
                />
            </Link>
        }
        <ShareContentButton uri={record.uri}/>
    </div>
}