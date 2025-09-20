import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { IconButton } from '@mui/material';
import {ModalOnClick} from "../../../../modules/ui-utils/src/modal-on-click";
import {ContentOptions} from "@/components/feed/content-options/content-options";
import {$Typed} from "@/lex-api/util";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion, ArCabildoabiertoDataDataset} from "@/lex-api/index";


export const ContentOptionsButton = ({
    record,
    enDiscusion=false,
    showBluesky,
    setShowBluesky,
}: {
    record?: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView> |
        $Typed<ArCabildoabiertoWikiTopicVersion.VersionInHistory> | $Typed<ArCabildoabiertoDataDataset.DatasetView> | $Typed<ArCabildoabiertoDataDataset.DatasetViewBasic>
    enDiscusion?: boolean
    showBluesky?: boolean
    setShowBluesky?: (v: boolean) => void
}) => {
    const modal = (onClose: () => void) => (
        <div className="text-base p-1 z-[3000]">
            <ContentOptions
                record={record}
                onClose={onClose}
                enDiscusion={enDiscusion}
                showBluesky={showBluesky}
                setShowBluesky={setShowBluesky}
            />
        </div>
    )

    return <ModalOnClick modal={modal} className={"mt-2 bg-[var(--background)] border border-[var(--text-light)]"}>
        <div className={"text-[var(--text-light)] text-xs"}>
            <IconButton
                color="inherit"
                size={"small"}
                sx={{borderRadius: 0}}
            >
                <MoreHorizIcon fontSize="inherit"/>
            </IconButton>
        </div>
    </ModalOnClick>
};