import {PostImagesEmbed} from "./post-images-embed";
import {PostRecordEmbedRecord} from "./post-record-embed";
import { ArCabildoabiertoEmbedRecordWithMedia } from "@cabildo-abierto/api";
import {ATProtoStrongRef} from "@/lib/types";
import {AppBskyEmbedImages, AppBskyEmbedVideo} from "@atproto/api"
import PostVideoEmbed from "./post-video-embed";

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
        <PostRecordEmbedRecord
            record={embed.record.record}
            mainPostRef={mainPostRef}
        />
        {/* TO DO: Implementar más casos */}
    </div>
}