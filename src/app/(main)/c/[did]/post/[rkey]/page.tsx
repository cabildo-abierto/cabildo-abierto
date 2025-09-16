"use client"
import {useThreadWithNormalizedContent} from "@/queries/useThread";
import {use, useMemo, useState} from "react";
import {getUri, shortCollectionToCollection} from "@/utils/uri";
import {ThreadHeader} from "@/components/thread/thread-header";
import {ReplyButton} from "@/components/thread/reply-button";
import {isPostView, isThreadViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {LoadingThread} from "@/components/thread/post/loading-thread";
import dynamic from "next/dynamic";


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
    const {thread} = useThreadWithNormalizedContent(uri)
    const [openReplyPanel, setOpenReplyPanel] = useState<boolean>(false)

    const replies = useMemo(() => {
        return <ThreadReplies
            replies={thread && thread != "loading" && thread.replies && isPostView(thread.content) ?  thread.replies : null}
        />
    }, [thread])

    const content = thread && thread != "loading" && isPostView(thread.content) ? thread.content : null
    const threadViewContent = thread && thread != "loading" ? thread : null

    if(!content || !threadViewContent) {
        return <LoadingThread collection={"app.bsky.feed.post"}/>
    }

    return <div className={"flex flex-col items-center"}>
        <ThreadHeader c={collection}/>

        <Post
            postView={content}
            threadViewContent={threadViewContent}
        />

        {thread && thread != "loading" && <div className={"w-full border-b"}>
            <ReplyButton onClick={() => {
                setOpenReplyPanel(true)
            }}/>
        </div>}

        {openReplyPanel && <div/>}

        <div className={"min-h-screen flex flex-col items-center w-full"}>
            {replies}
        </div>

        {thread && thread != "loading" && isThreadViewContent(thread) && isPostView(thread.content) && <WritePanel
            replyTo={thread.content}
            open={openReplyPanel}
            onClose={() => {
                setOpenReplyPanel(false)
            }}
        />}
    </div>
}

export default Page
