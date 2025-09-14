import {PostImagesEmbed} from "@/components/feed/embed/post-images-embed";
import {PostRecordEmbedRecord} from "@/components/feed/embed/post-record-embed";
import {ATProtoStrongRef} from "@/lib/types";
import {AppBskyEmbedRecordWithMedia, AppBskyEmbedImages} from "@atproto/api"

type PostRecordWithMediaEmbedProps = {
    embed: AppBskyEmbedRecordWithMedia.View
    mainPostRef: ATProtoStrongRef
}

export const PostRecordWithMediaEmbed = ({embed, mainPostRef}: PostRecordWithMediaEmbedProps) => {

    return <div className={"flex flex-col space-y-2"}>
        {AppBskyEmbedImages.isView(embed.media) && <PostImagesEmbed embed={embed.media}/>}
        {<PostRecordEmbedRecord record={embed.record.record} mainPostRef={mainPostRef}/>}
        {/* TO DO: Implementar más casos */}
    </div>
}