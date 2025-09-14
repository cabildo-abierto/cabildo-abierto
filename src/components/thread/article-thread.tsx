import {ReplyButton} from "./reply-button"
import {useEffect, useMemo, useState} from "react";
import {ThreadHeader} from "@/components/thread/thread-header";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import dynamic from "next/dynamic";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoEmbedSelectionQuote} from "@/lex-api/index"
import ThreadReplies from "./thread-replies";
import Article from "./article/article";


const WritePanel = dynamic(() => import("@/components/writing/write-panel/write-panel"), {
    ssr: false,
    loading: () => <div/>
})

function hasSelectionQuote(p: ArCabildoabiertoFeedDefs.PostView) {
    return ArCabildoabiertoEmbedSelectionQuote.isView(p.embed)
}


function getThreadQuoteReplies(t: ArCabildoabiertoFeedDefs.ThreadViewContent) {
    const r = t.replies
    const contents = r.filter(ArCabildoabiertoFeedDefs.isThreadViewContent).map(r => r.content)
    const postViews = contents.filter(ArCabildoabiertoFeedDefs.isPostView)
    return postViews.filter(hasSelectionQuote)
}


const ArticleThread = ({thread}: { thread: ArCabildoabiertoFeedDefs.ThreadViewContent }) => {
    const [openReplyPanel, setOpenReplyPanel] = useState<boolean>(false)
    const [pinnedReplies, setPinnedReplies] = useState<string[]>([])
    const [quoteReplies, setQuoteReplies] = useState<ArCabildoabiertoFeedDefs.PostView[]>([])

    useEffect(() => {
        if (ArCabildoabiertoFeedDefs.isFullArticleView(thread.content) && thread.replies) {
            setQuoteReplies(getThreadQuoteReplies(thread))
        }
    }, [thread, thread.replies, thread.content])

    const replies = useMemo(() => {
        if(thread.replies && ArCabildoabiertoFeedDefs.isFullArticleView(thread.content)) {
            return <ThreadReplies
                setPinnedReplies={setPinnedReplies}
                replies={thread.replies}
            />
        }
        return null
    }, [thread.content, thread.replies])

    if(!ArCabildoabiertoFeedDefs.isFullArticleView(thread.content)) return null

    return <div className={"flex flex-col items-center"}>
        <ThreadHeader c={"ar.cabildoabierto.feed.article"}/>

        <Article
            article={thread.content}
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

        <WritePanel
            replyTo={thread.content}
            open={openReplyPanel}
            onClose={() => {
                setOpenReplyPanel(false)
            }}
        />
    </div>
}


export default ArticleThread