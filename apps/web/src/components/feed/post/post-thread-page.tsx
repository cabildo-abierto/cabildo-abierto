import {ReplyButton} from "../utils/reply-button";
import Post from "./post";
import {useMemo, useState} from "react";
import {useSession} from "@/components/auth/use-session";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import ThreadReplies from "../thread-replies";
import {threadQueryKey} from "@/queries/getters/useThread";
import dynamic from "next/dynamic";
import {useAPI} from "@/components/utils/react/queries";
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api";
import {threadApiUrl} from "@/components/utils/react/url";

const WritePanel = dynamic(() => import('../../writing/write-panel/write-panel'), {
    ssr: false
})


const PostThreadPage = ({content, thread}: {
    content: ArCabildoabiertoFeedDefs.PostView,
    thread: ArCabildoabiertoFeedDefs.ThreadViewContent,
}) => {
    const [openReplyPanel, setOpenReplyPanel] = useState<boolean>(false)
    const {user} = useSession()
    const query = useAPI<ArCabildoabiertoFeedDefs.ThreadViewContent>(threadApiUrl(content.uri), threadQueryKey(content.uri))

    const replies = useMemo(() => {
        return <div>
            <ThreadReplies
                parentRef={ArCabildoabiertoFeedDefs.isPostView(thread.content) || ArCabildoabiertoFeedDefs.isFullArticleView(thread.content) ? thread.content : undefined}
                replies={thread.replies}
            />
            {query.isFetching && !thread.replies && <div className={"py-16"}>
                <LoadingSpinner/>
            </div>}
        </div>
    }, [thread, query.isFetching])

    return <div className={"flex flex-col items-center pt-4 pb-32"}>
        <Post
            postView={{$type: "ar.cabildoabierto.feed.defs#postView", ...content}}
            threadViewContent={thread}
        />

        {thread && <div className={"w-full"}>
            <ReplyButton
                size={"large"}
                onClick={() => {
                    setOpenReplyPanel(true)
                }}
            />
        </div>}

        {openReplyPanel && <div/>}

        <div className={"min-h-screen flex flex-col items-center w-full"}>
            {replies}
        </div>

        {user && ArCabildoabiertoFeedDefs.isThreadViewContent(thread) && ArCabildoabiertoFeedDefs.isPostView(thread.content) && <WritePanel
            replyTo={thread.content}
            open={openReplyPanel}
            onClose={() => {
                setOpenReplyPanel(false)
            }}
        />}
    </div>
}


export default PostThreadPage