"use client"
import { FastPost } from "./fast-post"
import {ArticleProps, FastPostProps, ThreadProps} from "../../app/lib/definitions"
import { ReplyButton } from "./reply-button"
import { FastPostPreview } from "./fast-post-preview"
import {useState} from "react";
import {WritePanel} from "../write-panel";
import {Article} from "./article";



export const Thread = ({thread}: {thread: ThreadProps}) => {
    const [openReplyPanel, setOpenReplyPanel] = useState<boolean>(false)

    return <div>
        {thread.post.collection == "app.bsky.feed.post" && <FastPost
            content={thread.post as FastPostProps}
        />}
        {thread.post.collection == "ar.com.cabildoabierto.article" && <Article
            content={thread.post as ArticleProps}
        />}
        <ReplyButton onClick={() => {setOpenReplyPanel(true)}}/>
        {thread.replies.map((r, index) => {
            return <div key={index}>
                <FastPostPreview
                    post={r}
                    showParent={false}
                    parentIsMainPost={true}
                />
            </div>
        })}
        <WritePanel replyTo={thread.post} open={openReplyPanel} onClose={() => {setOpenReplyPanel(false)}}/>
    </div>
}