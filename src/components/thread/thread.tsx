import {ReplyButton} from "./reply-button"
import {useEffect, useMemo, useState} from "react";
import {getCollectionFromUri, isArticle} from "@/utils/uri";
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
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import WritePanel from "@/components/writing/write-panel/write-panel";


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

    const content = postOrArticle(thread.content) ? thread.content : null

    useEffect(() => {
        if (isFullArticleView(content) && thread.replies) {
            setQuoteReplies(getThreadQuoteReplies(thread))
        }
    }, [thread, thread.replies, content])


    const replies = useMemo(() => {
        const collection = getCollectionFromUri(content.uri)
        return thread.replies ? <ThreadReplies
            threadUri={content.uri}
            setPinnedReplies={isArticle(collection) ? setPinnedReplies : null}
            replies={thread.replies}
        /> : undefined
    }, [content.uri, thread.replies])

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

        <div className={"min-h-screen flex flex-col items-center w-full"}>
            {replies}

            {!thread.replies && <div className={"py-4"}>
                <LoadingSpinner/>
            </div>}
        </div>

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