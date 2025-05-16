import { useState } from "react";
import ShareIcon from '@mui/icons-material/Share';
import {contentUrl, getRkeyFromUri} from "@/utils/uri";
import {OptionsDropdownButton} from "./options-dropdown-button";

export const ShareContentButton = ({uri}: {uri: string}) => {
    const [onClipboard, setOnClipboard] = useState(false);

    const onShare = async () => {
        try {
            const url = "https://www.cabildoabierto.com.ar" + contentUrl(uri)

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

    return <OptionsDropdownButton
        handleClick={async () => {await onShare(); return {}}}
        startIcon={<ShareIcon/>}
        text1={<div className="whitespace-nowrap">{!onClipboard ? "Compartir" : "Link copiado"}</div>}
        disabled={getRkeyFromUri(uri) == "optimistic"}
    />
};