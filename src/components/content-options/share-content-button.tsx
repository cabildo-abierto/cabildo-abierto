import { useState } from "react";
import ShareIcon from '@mui/icons-material/Share';
import {FeedContentProps} from "../../app/lib/definitions";
import {BasicButton} from "../ui-utils/basic-button";
import {contentUrl} from "../utils/uri";
import {DropdownButton} from "./dropdown-button";

export const ShareContentButton = ({ content }: { content: FeedContentProps }) => {
    const [onClipboard, setOnClipboard] = useState(false);

    const onShare = async () => {
        try {
            const url = "https://www.cabildoabierto.com.ar" + contentUrl(content.uri)

            navigator.clipboard.writeText(url).then(
                () => {
                    setOnClipboard(true);
                    setTimeout(() => setOnClipboard(false), 2000);
                }
            )
            return {}
        } catch {
            return {error: "Error al copiar el link."}
        }
    };

    return <DropdownButton
        handleClick={async () => {await onShare(); return {}}}
        startIcon={<ShareIcon/>}
        text1={<div className="whitespace-nowrap">{!onClipboard ? "Compartir" : "Link copiado"}</div>}
    />
};