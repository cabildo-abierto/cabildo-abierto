"use client"

import {
    FastPostProps,
    FeedContentProps,
    FeedContentPropsMaybe,
    ReasonProps,
    RecordProps,
    SmallUserProps
} from '../../app/lib/definitions'
import {FastPostPreviewFrame, ReplyVerticalLine} from './fast-post-preview-frame'
import {FastPostContent} from "./fast-post-content";
import {FeedElement} from "./feed-element";
import {IsReplyMessage} from "./is-reply-message";
import Link from "next/link";
import {useUser} from "../../hooks/user";
import { useSWRConfig } from 'swr';
import {contentUrl, getDidFromUri, getRkeyFromUri, isPost, threadApiUrl, topicUrl} from "../utils/uri";

const ShowThreadButton = ({root}: {root: RecordProps}) => {
    const url = contentUrl(root.uri)
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
    post: FastPostProps & ReasonProps
    showingChildren?: boolean
    showingParent?: boolean
    parentIsMainPost?: boolean
    className?: string
    onClickQuote?: (cid: string) => void
    showReplyMessage?: boolean
    repostedBy?: {handle: string, displayName?: string}
    onDeleteFeedElem: () => Promise<void>
}

export const FastPostPreview = ({
    post,
    showingChildren=false,
    showingParent=false,
    showReplyMessage=false,
    onClickQuote,
    onDeleteFeedElem
}: FastPostPreviewProps) => {
    const {user} = useUser()
    const {mutate} = useSWRConfig()

    const onDelete = async () => {
        const replyTo = post.content.post.replyTo
        const root = post.content.post.root
        if(replyTo && replyTo.uri){
            mutate(threadApiUrl(replyTo.uri))
            mutate("/api/profile-feed/"+getDidFromUri(replyTo.uri)+"/main")
            mutate("/api/profile-feed/"+getDidFromUri(replyTo.uri)+"/replies")
        }
        mutate("/api/feed/InDiscussion")
        mutate("/api/feed/Following")
        if(root && root.uri){
            mutate(threadApiUrl(root.uri))
            mutate("/api/profile-feed/"+getDidFromUri(root.uri)+"/main")
            mutate("/api/profile-feed/"+getDidFromUri(root.uri)+"/replies")
            mutate("/api/profile-feed/"+getDidFromUri(root.uri)+"/replies")
        }
        await onDeleteFeedElem()
    }

    if(!post.content || !post.content.post){
        return <div className={"py-4"}>
            Ocurrió un error al mostrar el contenido
        </div>
    }

    const isRepost = post.reason != undefined
    const replyTo = post.content.post.replyTo
    const replyToAvailable = replyTo && ((replyTo as FeedContentPropsMaybe).createdAt != undefined || replyTo.notFound) && !isRepost

    const root = post.content.post.root
    const rootAvailable = root && ((root as FeedContentPropsMaybe).createdAt != undefined || root.notFound) && root.uri != replyTo.uri && !isRepost

    const parentReplyTo = replyToAvailable && isPost(replyTo.collection) && (replyTo as FastPostProps).content ? (replyTo as FastPostProps).content.post.replyTo : undefined

    const showThreadButton = replyToAvailable && rootAvailable && parentReplyTo && parentReplyTo.uri != root.uri

    return <div className={"flex flex-col w-full text-[15px]"}>
        {rootAvailable && <FeedElement
            elem={root as FeedContentPropsMaybe}
            showingChildren={true}
            onDeleteFeedElem={onDeleteFeedElem}
        />}
        {showThreadButton && <ShowThreadButton root={root as FeedContentPropsMaybe}/>}
        {replyToAvailable &&
            <FeedElement
                elem={replyTo as FeedContentPropsMaybe}
                showingChildren={true}
                showingParent={rootAvailable}
                onDeleteFeedElem={onDeleteFeedElem}
                showReplyMessage={showThreadButton}
            />
        }
        <FastPostPreviewFrame
            post={post}
            showingChildren={showingChildren}
            showingParent={replyToAvailable || showingParent}
            borderBelow={!showingChildren}
            onDelete={onDelete}
        >
            {replyTo && !replyToAvailable && showReplyMessage && (replyTo as FeedContentPropsMaybe).author && <IsReplyMessage
                author={(replyTo as FeedContentPropsMaybe).author}
                did={user.did}
                collection={(replyTo as FeedContentPropsMaybe).collection}
            />}
            <FastPostContent post={post} onClickQuote={onClickQuote}/>
        </FastPostPreviewFrame>
    </div>
}