import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { IconButton } from '@mui/material';
import {ModalOnClick} from "../../../../modules/ui-utils/src/modal-on-click";
import {ContentOptions} from "@/components/feed/content-options/content-options";
import {$Typed} from "@atproto/api";
import {ArticleView, FullArticleView, PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {VersionInHistory} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";


export const ContentOptionsButton = ({
    record,
    enDiscusion=false,
    showBluesky,
    setShowBluesky,
}: {
    record?: $Typed<PostView> | $Typed<ArticleView> | $Typed<FullArticleView> | $Typed<VersionInHistory>
    enDiscusion?: boolean
    showBluesky?: boolean
    setShowBluesky?: (v: boolean) => void
}) => {
    const modal = (onClose: () => void) => (
        <div className="text-base border rounded bg-[var(--background-dark)] p-1">
            <ContentOptions
                record={record}
                onClose={onClose}
                enDiscusion={enDiscusion}
                showBluesky={showBluesky}
                setShowBluesky={setShowBluesky}
            />
        </div>
    )

    return <ModalOnClick modal={modal}>
        <div className={"text-[var(--text-light)] text-xs"}>
            <IconButton
                color="inherit"
                size={"small"}
            >
                <MoreHorizIcon fontSize="inherit"/>
            </IconButton>
        </div>
    </ModalOnClick>
};