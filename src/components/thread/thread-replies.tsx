import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {PostPreview} from "@/components/feed/post/post-preview";
import {Dispatch, SetStateAction} from "react";
import {smoothScrollTo} from "../layout/utils/scroll";
import {FeedEndText} from "@/components/feed/feed/feed-end-text";
import {ATProtoStrongRef} from "@/lib/types";
import {AppBskyFeedPost} from "@atproto/api";


type ThreadRepliesProps = {
    replies: ArCabildoabiertoFeedDefs.ThreadViewContent["replies"] | null
    setPinnedReplies?: Dispatch<SetStateAction<string[]>>
    parentRef?: ATProtoStrongRef
}


export default function ThreadReplies({parentRef, replies, setPinnedReplies}: ThreadRepliesProps) {
    if (!replies) return null

    return <>
        {replies.map(r => {
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
            const editedParent = parentRef && ArCabildoabiertoFeedDefs.isPostView(r.content) && parentRef.cid != (r.content.record as AppBskyFeedPost.Record)?.reply?.parent.cid

            return <div key={r.content.uri} className={"w-full"}>
                <PostPreview
                    postView={r.content}
                    parentIsMainPost={true}
                    onClickQuote={onClickQuote}
                    threadViewContent={r}
                    editedParent={editedParent}
                />
            </div>
        })}
        {replies.length == 0 && <FeedEndText text={"Todavía no hay respuestas."}/>}
    </>
}