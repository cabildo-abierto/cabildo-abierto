"use client"

import { FeedContentProps } from '../../app/lib/definitions'
import { ATProtoPostFrame } from './atproto-post-frame'
import { BskyRichTextContent } from './bsky-rich-text-content';

export type ATProtoFastPostProps = {
    content: FeedContentProps
}


export const ATProtoFastPostPreview = ({content}: ATProtoFastPostProps) => {

    return <ATProtoPostFrame content={content}>
        <BskyRichTextContent content={content}/>
    </ATProtoPostFrame>
}