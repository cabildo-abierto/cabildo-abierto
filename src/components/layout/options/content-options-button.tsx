import {ContentOptions} from "@/components/layout/options/content-options";
import {$Typed} from "@/lex-api/util";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion, ArCabildoabiertoDataDataset} from "@/lex-api";
import { Color } from "../utils/color";
import {OptionsButton} from "./options-button";


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
    return <OptionsButton
        iconFontSize={iconFontSize}
        iconHoverColor={iconHoverColor}
    >
        {onClose => <ContentOptions
            record={record}
            onClose={onClose}
            enDiscusion={enDiscusion}
            showBluesky={showBluesky}
            setShowBluesky={setShowBluesky}
        />}
    </OptionsButton>
};