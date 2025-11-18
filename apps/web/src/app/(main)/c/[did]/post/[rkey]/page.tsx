"use client"
import {useThreadWithNormalizedContent} from "@/queries/getters/useThread";
import {use} from "react";
import {getUri} from "@cabildo-abierto/utils";
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {LoadingThread} from "@/components/feed/post/loading-thread";
import dynamic from "next/dynamic";
import {ContentNotFoundPage} from "@/components/feed/content-not-found-page";


const PostThreadPage = dynamic(() => import("@/components/feed/post/post-thread-page"), {
    ssr: false
})

const Page = ({params}: {
    params: Promise<{
        did: string, rkey: string
    }>
}) => {
    const {did: handleOrDid, rkey} = use(params)
    const niceUri = getUri(
        decodeURIComponent(handleOrDid),
        "app.bsky.feed.post",
        rkey
    )
    const {thread} = useThreadWithNormalizedContent(niceUri)

    if (thread == "loading") {
        return <LoadingThread collection={"app.bsky.feed.post"}/>
    }

    if (!thread || !ArCabildoabiertoFeedDefs.isPostView(thread.content)) {
        return <ContentNotFoundPage/>
    }

    return <PostThreadPage content={thread.content} thread={thread}/>
}

export default Page
