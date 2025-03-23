import {RecordProps, VisualizationProps} from "../../app/lib/definitions";
import {BasicButton} from "../ui-utils/basic-button";
import StateButton from "../ui-utils/state-button";
import Link from "next/link";
import {useUser} from "../../hooks/user";
import {deleteRecords} from "../../actions/admin";
import {ShareContentButton} from "./share-content-button";
import {editVisualizationUrl, getBlueskyUrl} from "../utils/uri";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {DropdownButton} from "./dropdown-button";


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


export const ContentOptions = ({onClose, record, onDelete}: {
    onClose: () => void
    record: RecordProps
    onDelete?: () => Promise<void>
}) => {
    const {user} = useUser()

    async function onClickDelete() {
        await deleteRecords({uris: [record.uri], atproto: true})
        await onDelete()
    }

    const inBluesky = record.collection == "app.bsky.feed.post"

    return <div className={"flex flex-col space-y-1"}>
        {user.did == record.author.did && <DropdownButton
            handleClick={async () => {await onClickDelete(); onClose(); return {}}}
            startIcon={<DeleteOutlineIcon/>}
            text1={"Borrar " + collection2displayText[record.collection]}
        />}
        {inBluesky && <Link target={"_blank"} href={getBlueskyUrl(record.uri)}>
            <DropdownButton
                text1={"Ver en Bluesky"}
            />
        </Link>}
        {record.collection == "ar.com.cabildoabierto.dataset" && <Link
            href={editVisualizationUrl(record.uri)}
            onClick={(e) => {e.stopPropagation()}}
        >
            <DropdownButton
                text1={"Usar en visualización"}
            />
        </Link>}
        {record.collection == "ar.com.cabildoabierto.visualization" &&
            <DropdownButton
                handleClick={async () => {openJsonInNewTab(JSON.parse((record as VisualizationProps).visualization.spec)); return {}}}
                text1={"Ver especificación"}
            />
        }
        {record.collection == "ar.com.cabildoabierto.visualization" &&
            <Link href={editVisualizationUrl(record.uri)} onClick={(e) => {e.stopPropagation()}}>
                <DropdownButton
                    text1={"Editar"}
                />
            </Link>
        }
        <ShareContentButton content={record}/>
    </div>
}