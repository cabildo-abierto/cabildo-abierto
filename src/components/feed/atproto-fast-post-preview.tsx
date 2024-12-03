"use client"

import { FeedContentProps } from '../../app/lib/definitions'
import ReplyIcon from '../icons/reply-icon';
import { ATProtoPostFrame } from './atproto-post-frame'
import { BskyFastPostImage } from './bsky-fast-post-image';
import { BskyRichTextContent } from './bsky-rich-text-content';
import { Username } from './username';

export type ATProtoFastPostProps = {
    content: FeedContentProps
    borderBelow?: boolean
    showingChildren?: boolean
    showingParent?: boolean
    parentIsMainContent?: boolean
}


export const ATProtoFastPostPreview = ({content, borderBelow=true, showingParent=false, showingChildren=false, parentIsMainContent=false}: ATProtoFastPostProps) => {

    const hasParent = content.post.record.reply != undefined

    return <div className="flex flex-col w-full">
        {hasParent && showingParent && 
            <ATProtoFastPostPreview content={content.post.record.reply.parent} borderBelow={false} showingChildren={true}/>
        }
        <ATProtoPostFrame content={content} borderBelow={borderBelow} showingParent={hasParent && showingParent} showingChildren={showingChildren}>
            {hasParent && !showingParent && <div className="text-sm text-[var(--text-light)]"><ReplyIcon fontSize="inherit"/> Respuesta a <Username user={content.post.record.reply.parent.author}/></div>}
            <BskyRichTextContent content={content}/>
            <BskyFastPostImage content={content}/>
        </ATProtoPostFrame>
    </div>
}