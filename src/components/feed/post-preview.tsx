"use client"

import {PostPreviewFrame, ReplyVerticalLine} from './post-preview-frame'
import {PostContent} from "./post-content";
import {FeedElement} from "./feed-element";
import {IsReplyMessage} from "./is-reply-message";
import Link from "next/link";
import {contentUrl} from "@/utils/uri";
import {useSession} from "@/hooks/swr";
import {isReasonRepost} from "@/lex-api/types/app/bsky/feed/defs";
import {FeedViewContent, isPostView, PostView} from '@/lex-api/types/ar/cabildoabierto/feed/defs';
import {isKnownContent} from "@/utils/type-utils";
import {Record as PostRecord} from "@/lex-api/types/app/bsky/feed/post"


const ShowThreadButton = ({uri}: {uri: string}) => {
    const url = contentUrl(uri)
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
    postView: PostView
    feedViewContent?: FeedViewContent
    showingChildren?: boolean
    showingParent?: boolean
    parentIsMainPost?: boolean
    className?: string
    onClickQuote?: (cid: string) => void
    showReplyMessage?: boolean
    repostedBy?: {handle: string, displayName?: string}
    onDeleteFeedElem: () => Promise<void>
}

export const PostPreview = ({
    postView,
    feedViewContent,
    showingChildren=false,
    showingParent=false,
    showReplyMessage=false,
    onClickQuote,
    onDeleteFeedElem
}: FastPostPreviewProps) => {
    const {user} = useSession()

    const onDelete = async () => {
        await onDeleteFeedElem()
    }

    const parent = feedViewContent && feedViewContent.reply && isKnownContent(feedViewContent.reply.parent) ? feedViewContent.reply.parent : null

    const root = feedViewContent && feedViewContent.reply && isKnownContent(feedViewContent.reply.root) && feedViewContent.reply.root.uri != parent.uri ? feedViewContent.reply.root : null

    const grandparentAuthor = feedViewContent && feedViewContent.reply ? feedViewContent.reply.grandparentAuthor : null

    const showThreadButton = root != null && isPostView(parent) && (parent.record as PostRecord).reply.parent.uri != root.uri

    return <div className={"flex flex-col w-full text-[15px] min-[680px]:min-w-[600px]"}>

        {root && <FeedElement
            elem={{content: feedViewContent.reply.root}}
            showingChildren={true}
            onDeleteFeedElem={onDeleteFeedElem}
        />}

        {showThreadButton && isKnownContent(feedViewContent.reply.root) && <ShowThreadButton uri={feedViewContent.reply.root.uri}/>}

        {parent &&
            <FeedElement
                elem={{content: feedViewContent.reply.parent}}
                showingChildren={true}
                showingParent={root != null}
                onDeleteFeedElem={onDeleteFeedElem}
                showReplyMessage={grandparentAuthor != null}
            />
        }

        <PostPreviewFrame
            reason={feedViewContent && feedViewContent.reason && isReasonRepost(feedViewContent.reason) ? feedViewContent.reason : undefined}
            postView={postView}
            showingChildren={showingChildren}
            showingParent={parent != null || showingParent}
            borderBelow={!showingChildren}
            onDelete={onDelete}
        >
            {parent && showReplyMessage && grandparentAuthor && <IsReplyMessage
                author={grandparentAuthor}
                did={user.did}
            />}
            <PostContent
                postView={postView}
                onClickQuote={onClickQuote}
            />
        </PostPreviewFrame>
    </div>
}