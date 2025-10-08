import {PostImagesEmbed} from "@/components/feed/embed/post-images-embed";
import {PostRecordWithMediaEmbed} from "@/components/feed/embed/post-record-with-media-embed";
import {PostRecordEmbed} from "@/components/feed/embed/post-record-embed";
import {PostExternalEmbed} from "@/components/feed/embed/post-external-embed";
import {ATProtoStrongRef} from "@/lib/types";
import {CAPostRecordEmbed} from "@/components/feed/embed/ca-post-record-embed";
import dynamic from "next/dynamic";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoEmbedSelectionQuote, ArCabildoabiertoEmbedRecord, ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {AppBskyEmbedExternal, AppBskyEmbedRecordWithMedia, AppBskyEmbedImages, AppBskyEmbedVideo, AppBskyEmbedRecord} from "@atproto/api"


const PostVideoEmbed = dynamic(() => import("@/components/feed/embed/post-video-embed"), {
    ssr: false,
    loading: () => <div className={"w-full flex justify-center"}>
        <div className={"w-[400px] h-[500px]"}/>
    </div>
})

const SelectionQuoteEmbed = dynamic(() => import("@/components/feed/embed/selection-quote/selection-quote-embed"), {
    ssr: false,
    loading: () => <></>
})

const Plot = dynamic(() => import("@/components/visualizations/plot"), {
    ssr: false
})

type PostEmbedProps = {
    embed: ArCabildoabiertoFeedDefs.PostView["embed"]
    mainPostRef: ATProtoStrongRef
    hideSelectionQuote?: boolean
    onClickSelectionQuote?: (cid: string) => void
    showContext?: boolean
    onArticle?: boolean
}


export const PostEmbed = ({embed, mainPostRef, hideSelectionQuote=false, onClickSelectionQuote, showContext=true, onArticle=false}: PostEmbedProps) => {
    return <>
        {AppBskyEmbedImages.isView(embed) && <PostImagesEmbed
            embed={embed}
            onArticle={onArticle}
        />}
        {AppBskyEmbedRecordWithMedia.isView(embed) && <PostRecordWithMediaEmbed
            embed={embed}
            mainPostRef={mainPostRef}
        />}
        {AppBskyEmbedVideo.isView(embed) && <PostVideoEmbed
            embed={embed}
        />}
        {AppBskyEmbedRecord.isView(embed) && <PostRecordEmbed
            embed={embed}
            mainPostRef={mainPostRef}
        />}
        {ArCabildoabiertoEmbedRecord.isView(embed) && <CAPostRecordEmbed
            embed={embed}
            mainPostRef={mainPostRef}
        />}
        {AppBskyEmbedExternal.isView(embed) && <PostExternalEmbed
            embed={embed}
        />}
        {!hideSelectionQuote && ArCabildoabiertoEmbedSelectionQuote.isView(embed) && <SelectionQuoteEmbed
            embed={embed}
            mainPostRef={mainPostRef}
            onClick={onClickSelectionQuote}
            showContext={showContext}
        />}
        {ArCabildoabiertoEmbedVisualization.isView(embed) && <Plot
            visualization={embed}
        />}
    </>
}