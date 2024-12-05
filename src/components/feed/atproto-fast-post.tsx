"use client"

import { FeedContentProps } from '../../app/lib/definitions'
import { ATProtoMainPostFrame } from './atproto-main-post-frame';
import { BskyFastPostImage } from './bsky-fast-post-image';
import { BskyRichTextContent } from './bsky-rich-text-content';
import {FastPostContent} from "./fast-post-content";

export type ATProtoFastPostProps = {
    content: FeedContentProps
}


export const ATProtoFastPost = ({content}: ATProtoFastPostProps) => {

    return <ATProtoMainPostFrame content={content.post}>
        <FastPostContent post={content.post} isMainPost={true}/>
    </ATProtoMainPostFrame>
}