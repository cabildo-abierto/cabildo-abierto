import {ModalOnClick} from "../../../../modules/ui-utils/src/modal-on-click";
import {ContentOptions} from "@/components/feed/content-options/content-options";
import {$Typed} from "@/lex-api/util";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion, ArCabildoabiertoDataDataset} from "@/lex-api/index";
import { IconButton } from '../../../../modules/ui-utils/src/icon-button';
import { DotsThreeIcon } from '@phosphor-icons/react';
import { Color } from "../../../../modules/ui-utils/src/color";


export const ContentOptionsButton = ({
    record,
    enDiscusion=false,
    showBluesky,
    setShowBluesky,
    iconFontSize,
    iconHoverColor="background-dark"
}: {
    record?: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView> |
        $Typed<ArCabildoabiertoWikiTopicVersion.VersionInHistory> | $Typed<ArCabildoabiertoDataDataset.DatasetView> | $Typed<ArCabildoabiertoDataDataset.DatasetViewBasic>
    enDiscusion?: boolean
    showBluesky?: boolean
    setShowBluesky?: (v: boolean) => void
    iconFontSize?: number
    iconHoverColor?: Color
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

    return <ModalOnClick modal={modal} className={"mt-2 panel-dark"}>
        <IconButton
            color="transparent"
            size={"small"}
            sx={{borderRadius: 0}}
            hoverColor={iconHoverColor}
        >
            <DotsThreeIcon color="var(--text)" weight="bold" fontSize={iconFontSize}/>
        </IconButton>
    </ModalOnClick>
};