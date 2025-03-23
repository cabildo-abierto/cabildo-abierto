import { useState } from "react";
import ShareIcon from '@mui/icons-material/Share';
import {FeedContentProps} from "../../app/lib/definitions";
import {BasicButton} from "../ui-utils/basic-button";
import {contentUrl} from "../utils/uri";

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

    return <BasicButton
        onClick={async (e) => {e.stopPropagation(); e.preventDefault(); await onShare()}}
        startIcon={<ShareIcon/>}
        color={"inherit"}
    >
        <div className="whitespace-nowrap w-20">{!onClipboard ? "Compartir" : "Link copiado"}</div>
    </BasicButton>
};