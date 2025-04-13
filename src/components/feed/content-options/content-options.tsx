import {RecordProps, VisualizationProps} from "@/lib/definitions";
import Link from "next/link";
import {deleteRecords} from "@/server-actions/admin";
import {ShareContentButton} from "./share-content-button";
import {editVisualizationUrl, getBlueskyUrl} from "@/utils/uri";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {OptionsDropdownButton} from "./options-dropdown-button";
import {BlueskyLogo} from "../../icons/bluesky-logo";
import {Newspaper} from "@mui/icons-material";
import {useSWRConfig} from "swr";
import {useState} from "react";
import {useUser} from "@/hooks/swr";
import {addToEnDiscusion, removeFromEnDiscusion} from "@/server-actions/feed/inicio/en-discusion";


const collection2displayText = {
    "ar.com.cabildoabierto.visualization": "visualización",
    "app.bsky.feed.post": "post",
    "ar.com.cabildoabierto.article": "artículo",
    "ar.com.cabildoabierto.quotePost": "respuesta",
    "ar.com.cabildoabierto.topic": "versión",
    "ar.com.cabildoabierto.dataset": "conjunto de datos"
}

export const openJsonInNewTab = (json: any) => {
    const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
}


export const ContentOptions = ({onClose, record, onDelete, enDiscusion="n/a"}: {
    onClose: () => void
    record: RecordProps
    onDelete?: () => Promise<void>
    enDiscusion?: string
}) => {
    const {user} = useUser()
    const {mutate} = useSWRConfig()
    const [addedToEnDiscusion, setAddedToEnDiscusion] = useState<string | null>(enDiscusion)

    async function onClickDelete() {
        await deleteRecords({uris: [record.uri], atproto: true})
        await onDelete()
    }

    const inBluesky = record.collection == "app.bsky.feed.post"

    return <div className={"flex flex-col space-y-1"}>
        {user.did == record.author.did && <OptionsDropdownButton
            handleClick={async () => {await onClickDelete(); onClose(); return {}}}
            startIcon={<DeleteOutlineIcon/>}
            text1={"Borrar " + collection2displayText[record.collection]}
        />}
        {user.did == record.author.did && enDiscusion != "n/a" && <OptionsDropdownButton
            handleClick={async () => {
                let r
                if(!addedToEnDiscusion){
                    const {uri} = await addToEnDiscusion({uri: record.uri, cid: record.cid})
                    setAddedToEnDiscusion(uri)
                } else {
                    r = await removeFromEnDiscusion(enDiscusion)
                    setAddedToEnDiscusion(null)
                }
                mutate("/api/feed/EnDiscusion")
                return r
            }}
            startIcon={<Newspaper/>}
            text1={!addedToEnDiscusion ? "Agregar a En discusión" : "Retirar de En discusión"}
        />}
        {inBluesky && <OptionsDropdownButton
            text1={"Ver en Bluesky"}
            startIcon={<BlueskyLogo/>}
            onClick={(e) => {e.stopPropagation(); window.open(getBlueskyUrl(record.uri), "_blank")}}
        />}
        {record.collection == "ar.com.cabildoabierto.dataset" && <Link
            href={editVisualizationUrl(record.uri)}
            onClick={(e) => {e.stopPropagation()}}
        >
            <OptionsDropdownButton
                text1={"Usar en visualización"}
            />
        </Link>}
        {record.collection == "ar.com.cabildoabierto.visualization" &&
            <OptionsDropdownButton
                handleClick={async () => {openJsonInNewTab(JSON.parse((record as VisualizationProps).visualization.spec)); return {}}}
                text1={"Ver especificación"}
            />
        }
        {record.collection == "ar.com.cabildoabierto.visualization" &&
            <Link href={editVisualizationUrl(record.uri)} onClick={(e) => {e.stopPropagation()}}>
                <OptionsDropdownButton
                    text1={"Editar"}
                />
            </Link>
        }
        <ShareContentButton content={record}/>
    </div>
}