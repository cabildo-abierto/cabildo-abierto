import {ReplyButton} from "@/components/thread/reply-button";
import {isPostView, isThreadViewContent, PostView, ThreadViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import Post from "./post";
import {useMemo, useState} from "react";
import {useSession} from "@/queries/getters/useSession";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import ThreadReplies from "../thread-replies";
import {threadQueryKey} from "@/queries/getters/useThread";
import dynamic from "next/dynamic";
import {useAPI} from "@/queries/utils";
import {threadApiUrl} from "@/utils/uri";

const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'), {
    ssr: false
})


const PostThreadPage = ({content, thread}: {
    content: PostView,
    thread: ThreadViewContent,
}) => {
    const [openReplyPanel, setOpenReplyPanel] = useState<boolean>(false)
    const {user} = useSession()
    const query = useAPI<ThreadViewContent>(threadApiUrl(content.uri), threadQueryKey(content.uri))

    const replies = useMemo(() => {
        return <div>
            <ThreadReplies
                replies={thread.replies}
            />
            {query.isFetching && !thread.replies && <div className={"py-16"}>
                <LoadingSpinner/>
            </div>}
        </div>
    }, [thread, query.isFetching])

    return <div className={"flex flex-col items-center pt-4"}>
        <Post
            postView={{$type: "ar.cabildoabierto.feed.defs#postView", ...content}}
            threadViewContent={thread}
        />

        {thread && <div className={"w-full border-b border-[var(--accent-dark)]"}>
            <ReplyButton onClick={() => {
                setOpenReplyPanel(true)
            }}/>
        </div>}

        {openReplyPanel && <div/>}

        <div className={"min-h-screen flex flex-col items-center w-full"}>
            {replies}
        </div>

        {user && isThreadViewContent(thread) && isPostView(thread.content) && <WritePanel
            replyTo={thread.content}
            open={openReplyPanel}
            onClose={() => {
                setOpenReplyPanel(false)
            }}
        />}
    </div>
}


export default PostThreadPage