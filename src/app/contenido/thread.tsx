"use client"
import { ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { ATProtoFastPost } from "../../components/feed/atproto-fast-post"
import { FeedContentProps } from "../lib/definitions"
import { ReplyButton } from "../../components/feed/reply-button"
import { ATProtoFastPostPreview } from "../../components/feed/atproto-fast-post-preview"



export const ATProtoThread = ({thread}: {thread: ThreadViewPost}) => {
    return <div>
        <ATProtoFastPost
            content={thread.post as unknown as FeedContentProps}
        />
        <ReplyButton/>
        {thread.replies.map((r, index) => {
            return <div key={index}>
                <ATProtoFastPostPreview content={r.post as unknown as FeedContentProps} parentIsMainContent={true}/>
            </div>
        })}
    </div>
}