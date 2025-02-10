"use client"

import {FastPostProps, FeedContentPropsNoRepostMaybe, RecordProps, SmallUserProps} from '../../app/lib/definitions'
import {FastPostPreviewFrame, ReplyVerticalLine} from './fast-post-preview-frame'
import {FastPostContent} from "./fast-post-content";
import {FeedElement} from "./feed-element";
import {contentUrl, emptyChar} from "../utils";
import {IsReplyMessage} from "./is-reply-message";
import Link from "next/link";

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
    showChildren?: boolean
    showParent?: boolean
    showingChildren?: boolean
    showingParent?: boolean
    parentIsMainPost?: boolean
    className?: string
    onClickQuote?: (cid: string) => void
    repostedBy?: {handle: string, displayName?: string}
    showReplyTo?: SmallUserProps
}

export const FastPostPreview = ({
                                           post,
                                           parentIsMainPost=false,
                                           showParent=false,
                                           showingChildren=false,
                                           showingParent=false,
                                           onClickQuote,
                                           showChildren=false,
                                           showReplyTo,
                                           repostedBy}: FastPostPreviewProps) => {

    const replyTo = post.content.post.replyTo
    const root = post.content.post.root
    const hasParent = replyTo != undefined && replyTo.collection != undefined
    const hasRoot = root != undefined && root.collection != undefined && root.uri != replyTo.uri
    const showingRoot = hasRoot && showParent

    const parentReplyTo = hasParent ? (replyTo as FastPostProps).content.post.replyTo : undefined

    const showThreadButton = parentReplyTo && hasRoot && parentReplyTo.uri != root.uri

    return <div className={"flex flex-col w-full"}>
        {showingRoot && <FeedElement elem={root as FeedContentPropsNoRepostMaybe} showingChildren={true}/>}
        {showThreadButton && <ShowThreadButton root={root as FeedContentPropsNoRepostMaybe}/>}
        {hasParent && showParent &&
            <FeedElement elem={replyTo as FeedContentPropsNoRepostMaybe} showingChildren={true} showingParent={hasRoot} showReplyTo={showThreadButton ? post.content.post.grandparentAuthor : undefined}/>
        }
        <FastPostPreviewFrame
            post={post}
            repostedBy={repostedBy}
            showingChildren={showingChildren}
            showingParent={showingParent || (hasParent && showParent)}
            borderBelow={!showingChildren}
        >
            {showReplyTo && <IsReplyMessage author={showReplyTo}/>}
            <FastPostContent post={post} onClickQuote={onClickQuote}/>
        </FastPostPreviewFrame>
    </div>
}