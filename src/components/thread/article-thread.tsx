import {ReplyButton} from "./reply-button"
import {useMemo, useState} from "react";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import dynamic from "next/dynamic";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoEmbedSelectionQuote} from "@/lex-api/index"
import ThreadReplies from "./thread-replies";
import Article from "./article/article";
import {useSession} from "@/queries/getters/useSession";
import {useLoginModal} from "@/components/layout/login-modal-provider";


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
    const {user} = useSession()
    const {setLoginModalOpen} = useLoginModal()

    const quoteReplies = useMemo(() => {
        return getThreadQuoteReplies(thread)
    }, [thread])

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
        <Article
            article={thread.content}
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
            quoteReplies={quoteReplies}
        />

        <div className={"w-full border-b border-[var(--accent-dark)]"}>
            <ReplyButton onClick={() => {
                if(user) {
                    setOpenReplyPanel(true)
                } else {
                    setLoginModalOpen(true)
                }
            }}/>
        </div>

        <div className={"min-h-screen flex flex-col items-center w-full"}>
            {replies}

            {!thread.replies && <div className={"py-4"}>
                <LoadingSpinner/>
            </div>}
        </div>

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