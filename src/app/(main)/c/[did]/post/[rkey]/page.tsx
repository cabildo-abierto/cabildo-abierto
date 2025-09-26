"use client"
import {useThreadWithNormalizedContent} from "@/queries/useThread";
import {use} from "react";
import {getUri, shortCollectionToCollection} from "@/utils/uri";
import {isPostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {LoadingThread} from "@/components/thread/post/loading-thread";
import dynamic from "next/dynamic";


const PostThreadPage = dynamic(() => import("@/components/thread/post/post-thread-page"), {
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

    const content = thread && thread != "loading" && isPostView(thread.content) ? thread.content : null
    const threadViewContent = thread && thread != "loading" ? thread : null

    if(!content || !threadViewContent) {
        return <LoadingThread collection={"app.bsky.feed.post"}/>
    }

    return <PostThreadPage content={content} thread={threadViewContent}/>
}

export default Page
