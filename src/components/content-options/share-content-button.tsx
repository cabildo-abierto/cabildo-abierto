import { useState } from "react";
import { articleUrl, contentUrl } from "../utils";
import { ContentOptionsChoiceButton } from "./content-options-button";
import ShareIcon from '@mui/icons-material/Share';
import { FeedContentProps } from "../../app/lib/definitions";

export const ShareContentButton = ({ content }: { content: FeedContentProps }) => {
    const [onClipboard, setOnClipboard] = useState(false);

    const onShare = async () => {
        try {
            const url = contentUrl(content.uri, content.author.handle)

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

    return <ContentOptionsChoiceButton
        onClick={onShare}
        icon={<ShareIcon/>}
    >
        <div className="whitespace-nowrap">{!onClipboard ? "Compartir" : "Link copiado"}</div>
    </ContentOptionsChoiceButton>
};