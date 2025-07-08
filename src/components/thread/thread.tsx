import {ReplyButton} from "./reply-button"
import {useEffect, useState} from "react";
import {getCollectionFromUri} from "@/utils/uri";
import {ThreadContent} from "@/components/thread/thread-content";
import {
    isFullArticleView,
    isPostView,
    isThreadViewContent,
    PostView,
    ThreadViewContent
} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {postOrArticle} from "@/utils/type-utils";
import {ThreadReplies} from "@/components/thread/thread-replies";
import {ThreadHeader} from "@/components/thread/thread-header";
import {isView as isSelectionQuoteView} from "@/lex-api/types/ar/cabildoabierto/embed/selectionQuote"
import dynamic from "next/dynamic";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";

const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'));

export function hasSelectionQuote(p: PostView) {
    return isSelectionQuoteView(p.embed)
}


function getThreadQuoteReplies(t: ThreadViewContent) {
    const r = t.replies
    const contents = r.filter(isThreadViewContent).map(r => r.content)
    const postViews = contents.filter(isPostView)
    return postViews.filter(hasSelectionQuote)
}


const Thread = ({thread}: { thread: ThreadViewContent }) => {
    const [openReplyPanel, setOpenReplyPanel] = useState<boolean>(false)
    const [pinnedReplies, setPinnedReplies] = useState<string[]>([])
    const [quoteReplies, setQuoteReplies] = useState<PostView[]>([])

    const replies = thread.replies
    const content = postOrArticle(thread.content) ? thread.content : null

    useEffect(() => {
        if (isFullArticleView(content) && replies) {
            setQuoteReplies(getThreadQuoteReplies(thread))
        }
    }, [thread, replies, content])

    return <div className={"flex flex-col items-center"}>
        <ThreadHeader c={getCollectionFromUri(content.uri)}/>

        <ThreadContent
            thread={thread}
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
            quoteReplies={quoteReplies}
        />

        <div className={"w-full border-b"}>
            <ReplyButton onClick={() => {
                setOpenReplyPanel(true)
            }}/>
        </div>

        {replies && <ThreadReplies
            threadUri={content.uri}
            setPinnedReplies={setPinnedReplies}
            replies={replies}
        />}

        {!replies && <div className={"py-4"}>
            <LoadingSpinner/>
        </div>}

        {postOrArticle(thread.content) && <WritePanel
            replyTo={thread.content}
            open={openReplyPanel}
            onClose={() => {
                setOpenReplyPanel(false)
            }}
        />}
    </div>
}


export default Thread