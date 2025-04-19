"use client"
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


export const PostEmbed = ({embed}: {embed: PostView["embed"]}) => {
    return <>
        {isEmbedImagesView(embed) && <PostImagesEmbed
            embed={embed}
        />}
        {isEmbedRecordWithMediaView(embed) && <PostRecordWithMediaEmbed
            embed={embed}
        />}
        {isVideoEmbedView(embed) && <PostVideoEmbed
            embed={embed}
        />}
        {isRecordEmbedView(embed) && <PostRecordEmbed
            embed={embed}
        />}
        {isExternalEmbedView(embed) && <PostExternalEmbed
            embed={embed}
        />}
        {/* TO DO: <PlotInPost
            post={post}
            interactive={isMainPost}
        />*/}
    </>
}