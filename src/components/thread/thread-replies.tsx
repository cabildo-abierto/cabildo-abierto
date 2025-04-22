import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {isPostView, isThreadViewContent, ThreadViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {smoothScrollTo} from "../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import {PostPreview} from "@/components/feed/post-preview";
import {LazyLoadFeed} from "@/components/feed/lazy-load-feed";
import {FeedGenerator} from "@/components/feed/feed";
import {ReactNode} from "react";
import {PrettyJSON} from "../../../modules/ui-utils/src/pretty-json";


type ThreadRepliesProps = {
    replies: ThreadViewContent[],
    pinnedReplies: string[],
    setPinnedReplies: (pinnedReplies: string[]) => void,
}


export const ThreadReplies = ({replies, pinnedReplies, setPinnedReplies}: ThreadRepliesProps) => {
    const generator: FeedGenerator = (index) => {
        const r = replies[index]

        if(isPostView(r.content)){

            function onClickQuote() {
                if(isThreadViewContent(r) && isPostView(r.content)) {
                    setPinnedReplies([r.content.cid])
                    const elem = document.getElementById("selection:"+r.content.cid)
                    smoothScrollTo(elem)
                }
            }

            const c: ReactNode = <div key={index} className={"w-full"}>
                <PostPreview
                    postView={r.content}
                    parentIsMainPost={true}
                    onClickQuote={onClickQuote}
                    onDeleteFeedElem={async () => {
                    }}
                />
            </div>

            return {c, key: r.content.uri}
        } else {
            return null
        }
    }

    return (
        <div className={"w-full mb-32"}>
            {!replies && <div className={"py-4"}>
                <LoadingSpinner/>
            </div>}
            {replies && replies.length > 0 && <LazyLoadFeed
                generator={generator}
                maxSize={replies.length}
            />}
            {replies && replies.length == 0 && <div className={"text-center text-[var(--text-light)] pt-4 pb-8"}>
                Todavía no hubo ninguna respuesta.
            </div>}
        </div>
    )
}