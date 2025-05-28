import {
    isPostView,
    isThreadViewContent,
    ThreadViewContent
} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {smoothScrollTo} from "../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import {PostPreview} from "@/components/feed/post/post-preview";
import {Dispatch, SetStateAction} from "react";
import {splitUri} from "@/utils/uri";
import StaticFeed from "@/components/feed/feed/static-feed";


type ThreadRepliesProps = {
    threadUri: string
    replies: ThreadViewContent["replies"]
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
}


export const ThreadReplies = ({threadUri, replies, setPinnedReplies}: ThreadRepliesProps) => {
    const {did, collection, rkey} = splitUri(threadUri)

    return (
        <div className={"w-full"}>
            <StaticFeed
                queryKey={["thread-feed", did, collection, rkey]}
                initialContents={replies}
                noResultsText={"Sé el primero en responder."}
                endText={""}
                FeedElement={({content: r}) => {
                    if (!isThreadViewContent(r) || !isPostView(r.content)) return null

                    function onClickQuote() {
                        if (isThreadViewContent(r) && isPostView(r.content)) {
                            setPinnedReplies([r.content.cid])
                            const elem = document.getElementById("selection:" + r.content.cid)
                            smoothScrollTo(elem)
                        }
                    }

                    return <PostPreview
                        postView={r.content}
                        parentIsMainPost={true}
                        onClickQuote={onClickQuote}
                        inThreadFeed={true}
                    />
                }}
            />
        </div>
    )
}