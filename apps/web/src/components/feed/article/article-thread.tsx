import {ReplyButton} from "../utils/reply-button"
import {useMemo, useState} from "react";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import dynamic from "next/dynamic";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoEmbedSelectionQuote} from "@cabildo-abierto/api"
import ThreadReplies from "../thread-replies";
import Article from "./article";
import {useSession} from "@/components/auth/use-session";
import {useLoginModal} from "../../auth/login-modal-provider";
import {DiscussionButton} from "../../tema/view/discussion-button";


const WritePanel = dynamic(() => import("../../writing/write-panel/write-panel"), {
    ssr: false
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
    const {user} = useSession()
    const {setLoginModalOpen} = useLoginModal()

    const quoteReplies = useMemo(() => {
        return getThreadQuoteReplies(thread)
    }, [thread])

    const replies = useMemo(() => {
        if (thread.replies && ArCabildoabiertoFeedDefs.isFullArticleView(thread.content)) {
            return <ThreadReplies
                setPinnedReplies={setPinnedReplies}
                replies={thread.replies}
                parentRef={thread.content}
            />
        }
        return null
    }, [thread.content, thread.replies])

    if (!ArCabildoabiertoFeedDefs.isFullArticleView(thread.content)) return null

    return <div className={"flex flex-col items-center"}>
        <Article
            article={thread.content}
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
            quoteReplies={quoteReplies}
        />

        <div className={"w-full border-b border-[var(--accent-dark)]"}>
            <ReplyButton
                onClick={() => {
                    if (user) {
                        setOpenReplyPanel(true)
                    } else {
                        setLoginModalOpen(true)
                    }
                }}
            />
        </div>

        <div className={"min-h-screen flex flex-col items-center w-full pb-32"}>
            {replies}

            {!thread.replies && <div className={"py-4"}>
                <LoadingSpinner/>
            </div>}
        </div>

        <DiscussionButton replyCount={thread.replies?.length ?? 0}/>

        {openReplyPanel && user && <WritePanel
            replyTo={thread.content}
            open={openReplyPanel}
            onClose={() => {
                setOpenReplyPanel(false)
            }}
        />}
    </div>
}


export default ArticleThread