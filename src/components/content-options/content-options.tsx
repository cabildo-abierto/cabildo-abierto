import {RecordProps, UserProps} from "../../app/lib/definitions";
import {BasicButton} from "../ui-utils/basic-button";
import {deleteRecords} from "../../actions/atproto-update";
import StateButton from "../state-button";
import {getBlueskyUrl} from "../utils";
import Link from "next/link";
import {useUser} from "../../hooks/user";

const collection2displayText = {
    "ar.com.cabildoabierto.visualization": "visualización",
    "app.bsky.feed.post": "post",
    "ar.com.cabildoabierto.article": "artículo",
    "ar.com.cabildoabierto.quotePost": "respuesta",
    "ar.com.cabildoabierto.topic": "versión"
}

export const ContentOptions = ({onClose, record}: {onClose: () => void, record: RecordProps}) => {
    const {user} = useUser()

    async function onDelete() {
        await deleteRecords({uris: [record.uri], atproto: true})
    }

    const inBluesky = record.collection == "app.bsky.feed.post"

    return <div className={"flex flex-col space-y-1"}>
        {user.did == record.author.did && <StateButton
            handleClick={async () => {await onDelete(); onClose(); return {}}}
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
    </div>
}