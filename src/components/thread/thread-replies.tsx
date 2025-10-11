import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {PostPreview} from "@/components/feed/post/post-preview";
import {Dispatch, SetStateAction} from "react";
import StaticFeed from "@/components/feed/feed/static-feed";
import {smoothScrollTo} from "../layout/utils/scroll";
import {$Typed} from "@atproto/api";
import {AppBskyFeedDefs} from "@atproto/api"


type ThreadRepliesProps = {
    replies: ArCabildoabiertoFeedDefs.ThreadViewContent["replies"] | null
    setPinnedReplies?: Dispatch<SetStateAction<string[]>>
}


export default function ThreadReplies({replies, setPinnedReplies}: ThreadRepliesProps) {
    if (!replies) return null
    console.log("replies in trhead replies", replies.length)
    return (
        <StaticFeed<$Typed<ArCabildoabiertoFeedDefs.ThreadViewContent> | $Typed<AppBskyFeedDefs.NotFoundPost> | $Typed<AppBskyFeedDefs.BlockedPost> | {
            $type: string
        }>
            initialContents={replies}
            noResultsText={"Todavía no hay respuestas."}
            endText={""}
            FeedElement={({content: r}) => {
                if ((!ArCabildoabiertoFeedDefs.isThreadViewContent(r) && !ArCabildoabiertoFeedDefs.isFeedViewContent(r)) || !ArCabildoabiertoFeedDefs.isPostView(r.content)) {
                    return null
                }

                function onClickQuote() {
                    if (ArCabildoabiertoFeedDefs.isThreadViewContent(r) && ArCabildoabiertoFeedDefs.isPostView(r.content)) {
                        setPinnedReplies([r.content.cid])
                        const elem = document.getElementById("selection:" + r.content.cid)
                        if (elem) {
                            smoothScrollTo(elem)
                        }
                    }
                }

                return <PostPreview
                    postView={r.content}
                    parentIsMainPost={true}
                    onClickQuote={onClickQuote}
                    threadViewContent={r}
                />
            }}
            getFeedElementKey={e => {
                if (ArCabildoabiertoFeedDefs.isThreadViewContent(e)) {
                    if (ArCabildoabiertoFeedDefs.isPostView(e.content) || ArCabildoabiertoFeedDefs.isArticleView(e.content)) {
                        return e.content.uri
                    }
                } else if (AppBskyFeedDefs.isBlockedPost(e) || AppBskyFeedDefs.isNotFoundPost(e)) {
                    return e.uri
                }
                return null
            }}
        />
    )
}