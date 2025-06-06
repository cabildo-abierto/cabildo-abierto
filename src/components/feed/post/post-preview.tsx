import {PostPreviewFrame, ReplyVerticalLine} from '../frame/post-preview-frame'
import {PostContent} from "./post-content";
import {IsReplyMessage} from "./is-reply-message";
import Link from "next/link";
import {contentUrl} from "@/utils/uri";
import {useSession} from "@/queries/api";
import {isReasonRepost} from "@/lex-api/types/app/bsky/feed/defs";
import {FeedViewContent, isPostView, PostView} from '@/lex-api/types/ar/cabildoabierto/feed/defs';
import {postOrArticle, isReplyRefContent, ReplyRefContent} from "@/utils/type-utils";
import {Record as PostRecord} from "@/lex-api/types/app/bsky/feed/post"
import {isTopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import dynamic from "next/dynamic";
const FeedElement = dynamic(() => import('@/components/feed/feed/feed-element'));


const ShowThreadButton = ({uri}: { uri: string }) => {
    const url = contentUrl(uri)
    return (
        <Link href={url} className="relative hover:bg-[var(--background-dark)] transition duration-200 flex h-full items-center">
            <div className={"w-full max-w-[13%] flex flex-col items-center justify-stretch"}>
                <ReplyVerticalLine className="h-2"/>
                <div className="text-xl text-[var(--accent)] leading-none py-1">
                    <div>⋮</div>
                </div>
                <ReplyVerticalLine className="h-2"/>
            </div>
            <div className={"absolute left-1/2 font-semibold -translate-x-1/2 text-center text-sm text-[var(--primary)]"}>
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
    repostedBy?: { handle: string, displayName?: string }
    inThreadFeed?: boolean
}

function getParentAndRoot(f: FeedViewContent): { parent?: ReplyRefContent, root?: ReplyRefContent } {
    if (!f || !f.reply) {
        return {}
    }
    const root = f.reply.root
    const parent = f.reply.parent

    if (!isReplyRefContent(parent)) {
        return {}
    }
    if (!isReplyRefContent(root)) {
        return {}
    }

    if (postOrArticle(root)) {
        if (!postOrArticle(parent)) {
            return {}
        }
        if (parent.uri != root.uri) {
            return {parent, root}
        } else {
            return {parent}
        }
    } else {
        if (isTopicViewBasic(parent)) {
            return {parent} // en este caso tienen que ser parent == root
        }
        return {parent, root}
    }
}


export const PostPreview = ({
                                postView,
                                feedViewContent,
                                showingChildren = false,
                                showingParent = false,
                                showReplyMessage = false,
                                onClickQuote,
                                inThreadFeed = false
                            }: FastPostPreviewProps) => {
    const {user} = useSession()

    const {parent, root} = getParentAndRoot(feedViewContent)

    const grandparentAuthor = feedViewContent && feedViewContent.reply ? feedViewContent.reply.grandparentAuthor : null

    const showThreadButton = !inThreadFeed && root != null && isPostView(parent) && ("uri" in root && (parent.record as PostRecord).reply.parent.uri != root.uri)

    return <div className={"flex flex-col w-full text-[15px] min-[680px]:min-w-[600px]"}>
        {!inThreadFeed && root && <FeedElement
            elem={{content: feedViewContent.reply.root}}
            showingChildren={true}
        />}

        {showThreadButton && postOrArticle(feedViewContent.reply.root) &&
            <ShowThreadButton uri={feedViewContent.reply.root.uri}/>
        }

        {!inThreadFeed && parent &&
            <FeedElement
                elem={{content: feedViewContent.reply.parent}}
                showingChildren={true}
                showingParent={root != null && postOrArticle(root)}
                showReplyMessage={grandparentAuthor != null}
            />
        }

        <PostPreviewFrame
            reason={feedViewContent && feedViewContent.reason && isReasonRepost(feedViewContent.reason) ? feedViewContent.reason : undefined}
            postView={{$type: "ar.cabildoabierto.feed.defs#postView", ...postView}}
            showingChildren={showingChildren}
            showingParent={(parent != null && postOrArticle(parent)) || showingParent}
            borderBelow={!showingChildren}
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