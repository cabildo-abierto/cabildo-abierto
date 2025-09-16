"use client"
import {useThreadWithNormalizedContent} from "@/queries/useThread";
import {ErrorPage} from "../../../../../../../modules/ui-utils/src/error-page";
import React from "react";
import {getUri, shortCollectionToCollection} from "@/utils/uri";
import {LoadingThread} from "@/components/thread/post/loading-thread";
import dynamic from "next/dynamic";

const ArticleThread = dynamic(() => import("@/components/thread/article-thread"), {ssr: false})


const Page = ({params}: {
    params: Promise<{
        did: string, rkey: string
    }>
}) => {
    const {did, rkey} = React.use(params)
    const collection = "ar.cabildoabierto.feed.article"
    const uri = getUri(decodeURIComponent(did), shortCollectionToCollection(collection), rkey)
    const {query: threadQuery, thread} = useThreadWithNormalizedContent(uri)

    if (threadQuery.isLoading || thread == "loading") return <LoadingThread collection={collection}/>

    if (threadQuery.error || !thread) return <ErrorPage>No se encontró el contenido.</ErrorPage>

    return <ArticleThread thread={thread}/>
}

export default Page
