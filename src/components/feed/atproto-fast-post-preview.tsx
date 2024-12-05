"use client"

import { FeedContentProps } from '../../app/lib/definitions'
import ReplyIcon from '../icons/reply-icon';
import { ATProtoPostFrame } from './atproto-post-frame'
import { BskyFastPostImage } from './bsky-fast-post-image';
import { BskyRichTextContent } from './bsky-rich-text-content';
import { Username } from './username';
import {IsReplyMessage} from "./is-reply-message";
import {RepostedBy} from "./reposted-by";
import {QuotedPost} from "./quoted-post";
import {FastPostContent} from "./fast-post-content";

export type ATProtoFastPostProps = {
    content: FeedContentProps
    borderBelow?: boolean
    showChildren?: boolean
    showParent?: boolean
    parentIsMainPost?: boolean
}


export const ATProtoFastPostPreview = ({
                                           content,
                                           borderBelow=true,
                                           parentIsMainPost=false,
                                           showParent=false,
                                           showChildren=false}: ATProtoFastPostProps) => {

    const post = content.post

    const hasParent = post.record.reply != undefined

    return <div className="flex flex-col w-full">
        {hasParent && showParent &&
            <ATProtoFastPostPreview content={{post: post.record.reply.parent}} borderBelow={false} showChildren={true}/>
        }
        <ATProtoPostFrame content={content} borderBelow={borderBelow} showingParent={hasParent && showParent} showingChildren={showChildren}>
            {hasParent && !showParent && !parentIsMainPost && <IsReplyMessage author={post.record.reply.parent.author}/>}
            <FastPostContent post={post}/>
        </ATProtoPostFrame>
    </div>
}