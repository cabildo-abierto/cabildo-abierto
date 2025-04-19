import {View as EmbedRecordWithMediaView} from "@/lex-api/types/app/bsky/embed/recordWithMedia";
import {isView as isEmbedImagesView} from "@/lex-api/types/app/bsky/embed/images"
import {PostImagesEmbed} from "@/components/feed/embed/post-images-embed";
import {PostRecordEmbedRecord} from "@/components/feed/embed/post-record-embed";


type PostRecordWithMediaEmbedProps = {
    embed: EmbedRecordWithMediaView
}

export const PostRecordWithMediaEmbed = ({embed}: PostRecordWithMediaEmbedProps) => {

    return <div className={"flex flex-col space-y-2"}>
        {isEmbedImagesView(embed.media) && <PostImagesEmbed embed={embed.media}/>}
        {<PostRecordEmbedRecord record={embed.record.record}/>}
        {/* TO DO: Implementar más casos */}
    </div>
}