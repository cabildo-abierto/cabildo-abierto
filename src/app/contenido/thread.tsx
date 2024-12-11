"use client"
import { ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { ATProtoFastPost } from "../../components/feed/atproto-fast-post"
import {FastPostProps} from "../lib/definitions"
import { ReplyButton } from "../../components/feed/reply-button"
import { FastPostPreview } from "../../components/feed/fast-post-preview"



export const ATProtoThread = ({thread}: {thread: ThreadViewPost}) => {

    return <div>
        <ATProtoFastPost
            content={{post: thread.post as unknown as FastPostProps}}
        />
        <ReplyButton/>
        {thread.replies.map((r, index) => {
            return <div key={index}>
                <FastPostPreview
                    content={{post: r.post as unknown as FastPostProps}}
                    showParent={false}
                    parentIsMainPost={true}
                />
            </div>
        })}
    </div>
}