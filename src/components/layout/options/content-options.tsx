import {OptionsShareButton} from "./options-share-button";
import OptionsDeleteButton from "@/components/layout/options/options-delete-button";
import {$Typed} from "@/lex-api/util";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion, ArCabildoabiertoDataDataset} from "@/lex-api"
import OptionsBlueskyReactionsButton from "@/components/layout/options/options-bluesky-reactions-button";
import OptionsOpenInBlueskyButton from "@/components/layout/options/options-open-in-bluesky-button";
import {OptionsEnDiscusionButton} from "@/components/layout/options/options-en-discusion-button";
import {OptionsEditContentButton} from "@/components/layout/options/options-edit-content-button";


export const ContentOptions = ({
                                   onClose,
                                   record,
                                   enDiscusion,
                                   showBluesky,
                                   setShowBluesky,
                               }: {
    onClose: () => void
    record: $Typed<ArCabildoabiertoFeedDefs.PostView> |
        $Typed<ArCabildoabiertoDataDataset.DatasetViewBasic> |
        $Typed<ArCabildoabiertoFeedDefs.ArticleView> |
        $Typed<ArCabildoabiertoFeedDefs.FullArticleView> |
        $Typed<ArCabildoabiertoWikiTopicVersion.VersionInHistory> |
        $Typed<ArCabildoabiertoDataDataset.DatasetView>
    enDiscusion: boolean
    showBluesky?: boolean,
    setShowBluesky?: (v: boolean) => void
}) => {


    return <>
        <OptionsDeleteButton uri={record.uri} onClose={onClose}/>
        <OptionsEnDiscusionButton
            uri={record.uri}
            enDiscusion={enDiscusion}
        />
        <OptionsEditContentButton record={record}/>
        <OptionsOpenInBlueskyButton uri={record.uri}/>
        <OptionsBlueskyReactionsButton showBluesky={showBluesky} setShowBluesky={setShowBluesky}/>
        <OptionsShareButton uri={record.uri} handle={record.author.handle}/>
    </>
}