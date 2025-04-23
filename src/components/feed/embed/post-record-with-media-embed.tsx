import {View as EmbedRecordWithMediaView} from "@/lex-api/types/app/bsky/embed/recordWithMedia";
import {isView as isEmbedImagesView} from "@/lex-api/types/app/bsky/embed/images"
import {PostImagesEmbed} from "@/components/feed/embed/post-images-embed";
import {PostRecordEmbedRecord} from "@/components/feed/embed/post-record-embed";
import {ATProtoStrongRef} from "@/lib/types";


type PostRecordWithMediaEmbedProps = {
    embed: EmbedRecordWithMediaView
    mainPostRef: ATProtoStrongRef
}

export const PostRecordWithMediaEmbed = ({embed, mainPostRef}: PostRecordWithMediaEmbedProps) => {

    return <div className={"flex flex-col space-y-2"}>
        {isEmbedImagesView(embed.media) && <PostImagesEmbed embed={embed.media}/>}
        {<PostRecordEmbedRecord record={embed.record.record} mainPostRef={mainPostRef}/>}
        {/* TO DO: Implementar más casos */}
    </div>
}