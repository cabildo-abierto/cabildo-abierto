"use client"
import {useThreadWithNormalizedContent} from "@/queries/useThread";
import {use, useMemo, useState} from "react";
import {getUri, shortCollectionToCollection} from "@/utils/uri";
import {ReplyButton} from "@/components/thread/reply-button";
import {isPostView, isThreadViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {LoadingThread} from "@/components/thread/post/loading-thread";
import dynamic from "next/dynamic";
import {useSession} from "@/queries/useSession";
import LoadingSpinner from "../../../../../../../modules/ui-utils/src/loading-spinner";


const ThreadReplies = dynamic(() => import("@/components/thread/thread-replies"), {
    ssr: false
})


const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'), {
    ssr: false
});


const Post = dynamic(() => import("@/components/thread/post/post"), {
    ssr: false
})


const Page = ({params}: {
    params: Promise<{
        did: string, rkey: string
    }>
}) => {
    const {did, rkey} = use(params)
    const collection = "app.bsky.feed.post"
    const uri = getUri(decodeURIComponent(did), shortCollectionToCollection(collection), rkey)
    const {thread, query} = useThreadWithNormalizedContent(uri)
    const [openReplyPanel, setOpenReplyPanel] = useState<boolean>(false)
    const {user} = useSession()

    const replies = useMemo(() => {
        return <div>
            <ThreadReplies
                replies={thread && thread != "loading" && thread.replies && isPostView(thread.content) ?  thread.replies : null}
            />
            {query.isFetching && <div className={"py-16"}>
                <LoadingSpinner/>
            </div>}
        </div>
    }, [thread, query.isFetching])

    const content = thread && thread != "loading" && isPostView(thread.content) ? thread.content : null
    const threadViewContent = thread && thread != "loading" ? thread : null

    if(!content || !threadViewContent) {
        return <LoadingThread collection={"app.bsky.feed.post"}/>
    }

    return <div className={"flex flex-col items-center pt-4"}>
        <Post
            postView={content}
            threadViewContent={threadViewContent}
        />

        {thread && thread != "loading" && <div className={"w-full border-b border-[var(--text-lighter)]"}>
            <ReplyButton onClick={() => {
                setOpenReplyPanel(true)
            }}/>
        </div>}

        {openReplyPanel && <div/>}

        <div className={"min-h-screen flex flex-col items-center w-full"}>
            {replies}
        </div>

        {user && thread && thread != "loading" && isThreadViewContent(thread) && isPostView(thread.content) && <WritePanel
            replyTo={thread.content}
            open={openReplyPanel}
            onClose={() => {
                setOpenReplyPanel(false)
            }}
        />}
    </div>
}

export default Page
