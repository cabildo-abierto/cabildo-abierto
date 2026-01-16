import {PostImagesEmbed} from "./post-images-embed";
import {PostRecordEmbedRecord} from "./post-record-embed";
import { ArCabildoabiertoEmbedRecordWithMedia } from "@cabildo-abierto/api";
import {ATProtoStrongRef} from "@cabildo-abierto/api";
import {AppBskyEmbedExternal, AppBskyEmbedImages, AppBskyEmbedVideo} from "@atproto/api"
import PostVideoEmbed from "./post-video-embed";
import {PostExternalEmbed} from "@/components/feed/embed/post-external-embed";

type PostRecordWithMediaEmbedProps = {
    embed: ArCabildoabiertoEmbedRecordWithMedia.View
    mainPostRef: ATProtoStrongRef
}

export const PostRecordWithMediaEmbed = ({
                                             embed,
                                             mainPostRef
}: PostRecordWithMediaEmbedProps) => {

    return <div className={"flex flex-col space-y-2"}>
        {AppBskyEmbedImages.isView(embed.media) && <PostImagesEmbed embed={embed.media}/>}
        {AppBskyEmbedVideo.isView(embed.media) && <PostVideoEmbed embed={embed.media}/>}
        {AppBskyEmbedExternal.isView(embed.media) && <PostExternalEmbed embed={embed.media}/>}
        <PostRecordEmbedRecord
            record={embed.record.record}
            mainPostRef={mainPostRef}
        />
    </div>
}