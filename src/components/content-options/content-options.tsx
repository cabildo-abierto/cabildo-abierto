import {RecordProps, VisualizationProps} from "../../app/lib/definitions";
import {BasicButton} from "../ui-utils/basic-button";
import StateButton from "../ui-utils/state-button";
import {editVisualizationUrl, getBlueskyUrl} from "../utils/utils";
import Link from "next/link";
import {useUser} from "../../hooks/user";
import {deleteRecords} from "../../actions/admin";


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
};

export const ContentOptions = ({onClose, record, onDelete}: {
    onClose: () => void
    record: RecordProps
    onDelete?: () => void
}) => {
    const {user} = useUser()

    async function onClickDelete() {
        await deleteRecords({uris: [record.uri], atproto: true})
        onDelete()
    }

    const inBluesky = record.collection == "app.bsky.feed.post"

    return <div className={"flex flex-col space-y-1"}>
        {user.did == record.author.did && <StateButton
            handleClick={async () => {await onClickDelete(); onClose(); return {}}}
            color={"inherit"}
            text1={"Borrar " + collection2displayText[record.collection]}
            disableElevation={true}
        />}
        {inBluesky && <Link target={"_blank"} href={getBlueskyUrl(record.uri)}>
            <BasicButton
                color={"inherit"}
            >
                Ver en Bluesky
            </BasicButton>
        </Link>}
        {record.collection == "ar.com.cabildoabierto.dataset" && <Link
            href={editVisualizationUrl(record.uri)}
            onClick={(e) => {e.stopPropagation()}}
        >
            <BasicButton
                fullWidth={true}
                color={"inherit"}
            >
                Usar en visualización
            </BasicButton>
        </Link>}
        {record.collection == "ar.com.cabildoabierto.visualization" &&
            <BasicButton
                fullWidth={true}
                color={"inherit"}
                onClick={(e) => {e.stopPropagation(); openJsonInNewTab(JSON.parse((record as VisualizationProps).visualization.spec))}}
            >
                Ver especificación
            </BasicButton>
        }
        {record.collection == "ar.com.cabildoabierto.visualization" &&
            <Link href={editVisualizationUrl(record.uri)} onClick={(e) => {e.stopPropagation()}}>
                <BasicButton
                    fullWidth={true}
                    color={"inherit"}
                >
                    Editar
                </BasicButton>
            </Link>
        }
    </div>
}