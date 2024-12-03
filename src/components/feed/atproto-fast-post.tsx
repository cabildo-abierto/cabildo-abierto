"use client"

import { FeedContentProps } from '../../app/lib/definitions'
import { ATProtoMainPostFrame } from './atproto-main-post-frame';
import { BskyFastPostImage } from './bsky-fast-post-image';
import { BskyRichTextContent } from './bsky-rich-text-content';

export type ATProtoFastPostProps = {
    content: FeedContentProps
}


export const ATProtoFastPost = ({content}: ATProtoFastPostProps) => {

    return <ATProtoMainPostFrame content={content}>
        <div className="text-lg">
            <BskyRichTextContent content={content}/>
        </div>
        <BskyFastPostImage content={content}/>
    </ATProtoMainPostFrame>
}