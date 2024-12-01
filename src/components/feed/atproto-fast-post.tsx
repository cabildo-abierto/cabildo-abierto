"use client"

import { FeedContentProps } from '../../app/lib/definitions'
import { ATProtoMainPostFrame } from './atproto-main-post-frame';
import { BskyRichTextContent } from './bsky-rich-text-content';

export type ATProtoFastPostProps = {
    content: FeedContentProps
}


export const ATProtoFastPost = ({content}: ATProtoFastPostProps) => {

    return <ATProtoMainPostFrame content={content}>
        <div className="text-lg">
            <BskyRichTextContent content={content}/>
        </div>
    </ATProtoMainPostFrame>
}