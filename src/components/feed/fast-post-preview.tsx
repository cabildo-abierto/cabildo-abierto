"use client"

import {FastPostProps, FeedContentPropsNoRepostMaybe, RecordProps, SmallUserProps} from '../../app/lib/definitions'
import {FastPostPreviewFrame, ReplyVerticalLine} from './fast-post-preview-frame'
import {FastPostContent} from "./fast-post-content";
import {FeedElement} from "./feed-element";
import {contentUrl, emptyChar} from "../utils";
import {IsReplyMessage} from "./is-reply-message";
import Link from "next/link";
import {useUser} from "../../hooks/user";

const ShowThreadButton = ({root}: {root: RecordProps}) => {
    const url = contentUrl(root.uri, root.author.handle)
    return (
        <Link href={url} className="hover:bg-[var(--background-dark)] transition duration-200 flex items-center">
            <div className={"w-[79px] pl-2 flex flex-col items-center"}>
                <ReplyVerticalLine className="h-2" />
                <div className="text-xl text-[var(--accent)] leading-none py-1">
                    <div>⋮</div>
                </div>
                <ReplyVerticalLine className="h-2" />
            </div>
            <div className={"text-sm flex items-center h-full text-[var(--primary)]"}>
                Ver thread completo
            </div>
        </Link>
    );
};


export type FastPostPreviewProps = {
    post: FastPostProps
    showingChildren?: boolean
    showingParent?: boolean
    parentIsMainPost?: boolean
    className?: string
    onClickQuote?: (cid: string) => void
    repostedBy?: {handle: string, displayName?: string}
}

export const FastPostPreview = ({
                                           post,
                                           showingChildren=false,
                                           showingParent=false,
                                           onClickQuote,
                                           repostedBy}: FastPostPreviewProps) => {
    const {user} = useUser()

    const replyTo = post.content.post.replyTo
    const replyToAvailable = replyTo && (replyTo as FeedContentPropsNoRepostMaybe).createdAt != undefined

    const root = post.content.post.root
    const rootAvailable = root && (root as FeedContentPropsNoRepostMaybe).createdAt != undefined

    const parentReplyTo = replyToAvailable && replyTo.collection == "ar.com.cabildoabierto.post" ? (replyTo as FastPostProps).content.post.replyTo : undefined

    const showThreadButton = replyToAvailable && rootAvailable && parentReplyTo && parentReplyTo.uri != root.uri

    const replyToPost = replyTo && (replyTo.collection == "app.bsky.feed.post" || replyTo.collection == "app.bsky.feed.quotePost")

    return <div className={"flex flex-col w-full"}>
        {rootAvailable && <FeedElement elem={root as FeedContentPropsNoRepostMaybe} showingChildren={true}/>}
        {showThreadButton && <ShowThreadButton root={root as FeedContentPropsNoRepostMaybe}/>}
        {replyToAvailable && replyToPost &&
            <FeedElement elem={replyTo as FeedContentPropsNoRepostMaybe} showingChildren={true} showingParent={rootAvailable}/>
        }
        <FastPostPreviewFrame
            post={post}
            repostedBy={repostedBy}
            showingChildren={showingChildren}
            showingParent={replyToAvailable && replyToPost}
            borderBelow={!showingChildren}
        >
            {(replyToAvailable && !replyToPost) && <IsReplyMessage
                author={(replyTo as FeedContentPropsNoRepostMaybe).author}
                did={user.did}
                collection={(replyTo as FeedContentPropsNoRepostMaybe).collection}
            />}
            <FastPostContent post={post} onClickQuote={onClickQuote}/>
        </FastPostPreviewFrame>
    </div>
}