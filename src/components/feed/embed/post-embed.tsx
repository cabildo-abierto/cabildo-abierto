import {isView as isEmbedImagesView} from "@/lex-api/types/app/bsky/embed/images";
import {PostImagesEmbed} from "@/components/feed/embed/post-images-embed";
import {isView as isEmbedRecordWithMediaView} from "@/lex-api/types/app/bsky/embed/recordWithMedia";
import {PostRecordWithMediaEmbed} from "@/components/feed/embed/post-record-with-media-embed";
import {isView as isVideoEmbedView} from "@/lex-api/types/app/bsky/embed/video";
import {PostVideoEmbed} from "@/components/feed/embed/post-video-embed";
import {isView as isRecordEmbedView} from "@/lex-api/types/app/bsky/embed/record";
import {PostRecordEmbed} from "@/components/feed/embed/post-record-embed";
import {isView as isExternalEmbedView} from "@/lex-api/types/app/bsky/embed/external";
import {PostExternalEmbed} from "@/components/feed/embed/post-external-embed";
import {PostView} from "@/lex-api/types/app/bsky/feed/defs";
import {isView as isSelectionQuoteView} from "@/lex-api/types/ar/cabildoabierto/embed/selectionQuote"
import {isView as isVisualizationEmbedView} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {SelectionQuoteEmbed} from "@/components/feed/embed/selection-quote/selection-quote-embed";
import {ATProtoStrongRef} from "@/lib/types";
import {Plot} from "@/components/visualizations/plot";
import {isView as isCARecordEmbedView} from "@/lex-api/types/ar/cabildoabierto/embed/record"
import {PrettyJSON} from "../../../../modules/ui-utils/src/pretty-json";
import {CAPostRecordEmbed} from "@/components/feed/embed/ca-post-record-embed";

type PostEmbedProps = {
    embed: PostView["embed"]
    mainPostRef: ATProtoStrongRef
    hideSelectionQuote?: boolean
    onClickSelectionQuote?: (cid: string) => void
    showContext?: boolean
    onArticle?: boolean
}


export const PostEmbed = ({embed, mainPostRef, hideSelectionQuote=false, onClickSelectionQuote, showContext=true, onArticle=false}: PostEmbedProps) => {
    return <>
        {isEmbedImagesView(embed) && <PostImagesEmbed
            embed={embed}
            onArticle={onArticle}
        />}
        {isEmbedRecordWithMediaView(embed) && <PostRecordWithMediaEmbed
            embed={embed}
            mainPostRef={mainPostRef}
        />}
        {isVideoEmbedView(embed) && <PostVideoEmbed
            embed={embed}
        />}
        {isRecordEmbedView(embed) && <PostRecordEmbed
            embed={embed}
            mainPostRef={mainPostRef}
        />}
        {isRecordEmbedView(embed) && <PostRecordEmbed
            embed={embed}
            mainPostRef={mainPostRef}
        />}
        {isCARecordEmbedView(embed) && <CAPostRecordEmbed
            embed={embed}
            mainPostRef={mainPostRef}
        />}
        {isExternalEmbedView(embed) && <PostExternalEmbed
            embed={embed}
        />}
        {!hideSelectionQuote && isSelectionQuoteView(embed) && <SelectionQuoteEmbed
            embed={embed}
            mainPostRef={mainPostRef}
            onClick={onClickSelectionQuote}
            showContext={showContext}
        />}
        {isVisualizationEmbedView(embed) && <Plot
            visualization={embed}
        />}
    </>
}