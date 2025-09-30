"use client"
import {useThreadWithNormalizedContent} from "@/queries/getters/useThread";
import {use} from "react";
import {getUri, shortCollectionToCollection} from "@/utils/uri";
import {isPostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {LoadingThread} from "@/components/thread/post/loading-thread";
import dynamic from "next/dynamic";
import {ContentNotFoundPage} from "@/components/thread/content-not-found-page";


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

    if (thread == "loading") {
        return <LoadingThread collection={"app.bsky.feed.post"}/>
    }

    if (!thread || !isPostView(thread.content)) {
        return <ContentNotFoundPage/>
    }

    return <PostThreadPage content={thread.content} thread={thread}/>
}

export default Page
