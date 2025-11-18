import {PostImagesEmbed} from "./post-images-embed";
import {PostRecordWithMediaEmbed} from "./post-record-with-media-embed";
import {PostExternalEmbed} from "./post-external-embed";
import {ATProtoStrongRef} from "@/lib/types";
import dynamic from "next/dynamic";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoEmbedRecordWithMedia, ArCabildoabiertoEmbedSelectionQuote, ArCabildoabiertoEmbedRecord, ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api"
import {AppBskyEmbedExternal, AppBskyEmbedImages, AppBskyEmbedVideo} from "@atproto/api"
import {PostRecordEmbed} from "./post-record-embed";
import {useLayoutConfig} from "../../layout/main-layout/layout-config-context";
import {pxToNumber} from "@cabildo-abierto/utils";


const PostVideoEmbed = dynamic(() => import("./post-video-embed"), {
    ssr: false,
    loading: () => <div className={"w-full flex justify-center"}>
        <div className={"w-[400px] h-[500px]"}/>
    </div>
})

const SelectionQuoteEmbed = dynamic(() => import("./selection-quote/selection-quote-embed"), {
    ssr: false,
    loading: () => <></>
})

const PlotWithButtons = dynamic(() => import("../../visualizations/editor/plot-with-buttons"), {
    ssr: false
})

type PostEmbedProps = {
    embed: ArCabildoabiertoFeedDefs.PostView["embed"]
    mainPostRef: ATProtoStrongRef
    hideSelectionQuote?: boolean
    onClickSelectionQuote?: (cid: string) => void
    showContext?: boolean
    onArticle?: boolean
    editedParent?: boolean
}


export const PostEmbed = ({embed, mainPostRef, hideSelectionQuote=false, onClickSelectionQuote, showContext=true, onArticle=false, editedParent}: PostEmbedProps) => {
    const {layoutConfig} = useLayoutConfig()

    return <div onClick={e => {e.stopPropagation()}}>
        {AppBskyEmbedImages.isView(embed) && <PostImagesEmbed
            embed={embed}
            onArticle={onArticle}
        />}
        {ArCabildoabiertoEmbedRecordWithMedia.isView(embed) && <PostRecordWithMediaEmbed
            embed={embed}
            mainPostRef={mainPostRef}
        />}
        {ArCabildoabiertoEmbedRecord.isView(embed) && <PostRecordEmbed
            embed={embed}
            mainPostRef={mainPostRef}
        />}
        {AppBskyEmbedVideo.isView(embed) && <PostVideoEmbed
            embed={embed}
        />}
        {AppBskyEmbedExternal.isView(embed) && <PostExternalEmbed
            embed={embed}
        />}
        {!hideSelectionQuote && ArCabildoabiertoEmbedSelectionQuote.isView(embed) && <SelectionQuoteEmbed
            embed={embed}
            mainPostRef={mainPostRef}
            onClick={onClickSelectionQuote}
            showContext={showContext}
            editedParent={editedParent}
        />}
        {ArCabildoabiertoEmbedVisualization.isView(embed) && <PlotWithButtons
            visualization={embed}
            width={pxToNumber(layoutConfig.centerWidth) * 0.85}
        />}
    </div>
}