import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {isPostView, isThreadViewContent, ThreadViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {smoothScrollTo} from "../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import {PostPreview} from "@/components/feed/post/post-preview";
import {Dispatch, SetStateAction} from "react";
import {Feed} from "../feed/feed/feed";


type ThreadRepliesProps = {
    replies: ThreadViewContent[]
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
}


export const ThreadReplies = ({replies, setPinnedReplies}: ThreadRepliesProps) => {

    const nodes = replies ? replies.map((r, i) => {
        if (!isPostView(r.content)) return null

        function onClickQuote() {
            if (isThreadViewContent(r) && isPostView(r.content)) {
                setPinnedReplies([r.content.cid])
                const elem = document.getElementById("selection:" + r.content.cid)
                smoothScrollTo(elem)
            }
        }

        return <div key={i}>
            <PostPreview
                postView={r.content}
                parentIsMainPost={true}
                onClickQuote={onClickQuote}
                onDeleteFeedElem={async () => {
                }}
                inThreadFeed={true}
            />
        </div>
    }) : []

    return (
        <div className={"w-full"}>
            <Feed
                initialContents={nodes}
                noResultsText={"Sé el primero en responder."}
            />
        </div>
    )
}