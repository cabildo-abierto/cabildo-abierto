import {PostPreviewFrame, ReplyVerticalLine} from '../frame/post-preview-frame'
import {PostContent} from "./post-content";
import {IsReplyMessage} from "./is-reply-message";
import Link from "next/link";
import {contentUrl} from "@/utils/uri";
import {useSession} from "@/queries/getters/useSession";
import {AppBskyFeedPost, AppBskyActorDefs} from "@atproto/api"
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {postOrArticle, isReplyRefContent, ReplyRefContent} from "@/utils/type-utils";
import FeedElement from "@/components/feed/feed/feed-element";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import {useLayoutConfig} from "@/components/layout/layout-config-context";


const ShowThreadButton = ({uri, handle}: { uri: string, handle?: string }) => {
    const url = contentUrl(uri, handle)
    const {isMobile} = useLayoutConfig()
    return (
        <Link href={url}
              className="relative hover:bg-[var(--background-dark)] flex h-full items-center"
        >
            <div className={"pl-4 pr-2 flex flex-col items-center justify-stretch"}>
                <ReplyVerticalLine className="h-2"/>
                <div className={"text-xl align-middle text-[var(--accent)] text-center leading-none py-1 " + (isMobile ? "w-9" : "w-11")}>
                    ⋮
                </div>
                <ReplyVerticalLine className="h-2"/>
            </div>
            <div
                className={"absolute left-1/2 -translate-x-1/2 text-center text-sm text-[var(--text-light)]"}>
                Ver hilo completo
            </div>
        </Link>
    );
};


export type FastPostPreviewProps = {
    postView: ArCabildoabiertoFeedDefs.PostView | null
    feedViewContent?: ArCabildoabiertoFeedDefs.FeedViewContent
    threadViewContent?: ArCabildoabiertoFeedDefs.ThreadViewContent
    showingChildren?: boolean
    showingParent?: boolean
    parentIsMainPost?: boolean
    className?: string
    onClickQuote?: (cid: string) => void
    showReplyMessage?: boolean
    repostedBy?: { handle: string, displayName?: string }
    pageRootUri?: string
    onFeed?: boolean
}

function getParentAndRoot(f: ArCabildoabiertoFeedDefs.FeedViewContent): { parent?: ReplyRefContent, root?: ReplyRefContent } {
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
        if (ArCabildoabiertoWikiTopicVersion.isTopicViewBasic(parent)) {
            return {parent} // en este caso tienen que ser parent == root
        }
        return {parent, root}
    }
}


const PostPreviewParentAndRoot = ({root, parent, grandparentAuthor, feedViewContent}: {
    root: ReplyRefContent
    parent: ReplyRefContent
    grandparentAuthor: AppBskyActorDefs.ProfileViewBasic
    feedViewContent: ArCabildoabiertoFeedDefs.FeedViewContent
}) => {
    const showThreadButton = root != null && ArCabildoabiertoFeedDefs.isPostView(parent) && ("uri" in root && (parent.record as AppBskyFeedPost.Record).reply.parent.uri != root.uri)

    return <>
        {root && <FeedElement
            elem={{content: feedViewContent.reply.root}}
            showingChildren={true}
        />}

        {showThreadButton && postOrArticle(feedViewContent.reply.root) &&
            <ShowThreadButton uri={feedViewContent.reply.root.uri} handle={feedViewContent.reply.root.author.handle}/>
        }

        {parent &&
            <FeedElement
                elem={{content: feedViewContent.reply.parent}}
                showingChildren={true}
                showingParent={root != null && postOrArticle(root)}
                showReplyMessage={grandparentAuthor != null}
            />
        }
    </>
}


function getChildrenFromThreadViewContent(t: ArCabildoabiertoFeedDefs.ThreadViewContent): ArCabildoabiertoFeedDefs.ThreadViewContent[] {
    const children: ArCabildoabiertoFeedDefs.ThreadViewContent[] = []
    let filteredReplies = t.replies?.filter(ArCabildoabiertoFeedDefs.isThreadViewContent)
    while (filteredReplies && filteredReplies.length > 0) {
        const child = filteredReplies[0]
        children.push(child)
        filteredReplies = child.replies?.filter(ArCabildoabiertoFeedDefs.isThreadViewContent)
    }
    return children
}


const ThreadChildren = ({threadChildren}: { threadChildren: ArCabildoabiertoFeedDefs.ThreadViewContent[] }) => {
    return <div>
        {threadChildren.map((a, index) => {
            if (ArCabildoabiertoFeedDefs.isPostView(a.content)) {
                return <div key={a.content.uri}>
                    <PostPreview
                        postView={a.content}
                        showingChildren={index < threadChildren.length - 1}
                        showingParent={true}
                    />
                </div>
            }
            return null
        })}
    </div>
}


export const PostPreview = ({
                                postView,
                                feedViewContent,
                                showingChildren = false,
                                showingParent = false,
                                showReplyMessage = false,
                                onClickQuote,
                                threadViewContent,
                                pageRootUri,
    onFeed = true
                            }: FastPostPreviewProps) => {
    const {user} = useSession()
    const {layoutConfig} = useLayoutConfig()

    const {parent, root} = getParentAndRoot(feedViewContent)
    const reason = feedViewContent && feedViewContent.reason && ArCabildoabiertoFeedDefs.isReasonRepost(feedViewContent.reason) ? feedViewContent.reason : undefined
    const grandparentAuthor = feedViewContent && feedViewContent.reply ? feedViewContent.reply.grandparentAuthor : null
    const children = threadViewContent ? getChildrenFromThreadViewContent(threadViewContent) : null
    showingChildren = showingChildren || children && children.length > 0

    return <div style={{maxWidth: layoutConfig.centerWidth}} className={"flex flex-col w-full text-[15px] " + (onFeed ? "min-[680px]:min-w-[600px]" : "") + (!postView && feedViewContent && (root || parent) ? " border-b" : "")}>
        {feedViewContent && <PostPreviewParentAndRoot
            feedViewContent={feedViewContent}
            root={root}
            parent={parent}
            grandparentAuthor={grandparentAuthor}
        />}

        {postView && <PostPreviewFrame
            reason={reason}
            postView={{$type: "ar.cabildoabierto.feed.defs#postView", ...postView}}
            showingChildren={showingChildren}
            showingParent={(parent != null && postOrArticle(parent)) || showingParent}
            borderBelow={!showingChildren}
            pageRootUri={pageRootUri}
            engagementIcons={onFeed}
            onWritePost={!onFeed}
        >
            {parent && showReplyMessage && grandparentAuthor && <IsReplyMessage
                author={grandparentAuthor}
                did={user.did}
            />}
            <PostContent
                postView={postView}
                onClickQuote={onClickQuote}
            />
        </PostPreviewFrame>}

        {threadViewContent && <ThreadChildren
            threadChildren={children}
        />}
    </div>
}