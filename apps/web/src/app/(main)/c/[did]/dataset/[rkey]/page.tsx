"use client"
import {useThreadWithNormalizedContent} from "@/queries/getters/useThread";
import React from "react";
import {getUri, shortCollectionToCollection} from "@cabildo-abierto/utils/dist/uri";
import {ArCabildoabiertoDataDataset} from "@cabildo-abierto/api"
import {LoadingThread} from "@/components/feed/post/loading-thread";
import dynamic from "next/dynamic";
import { ContentNotFoundPage } from "@/components/feed/content-not-found-page";
const DatasetPage = dynamic(() => import("@/components/dataset/dataset-page"), {
    ssr: false
})


const ContentPage = ({params}: {
    params: Promise<{
        did: string, rkey: string
    }>
}) => {
    const {did, rkey} = React.use(params)
    const collection = "ar.cabildoabierto.data.dataset"
    const uri = getUri(decodeURIComponent(did), shortCollectionToCollection(collection), rkey)
    const {query: threadQuery, thread} = useThreadWithNormalizedContent(uri)

    if (threadQuery.isLoading || thread == "loading") return <LoadingThread collection={collection}/>

    if (threadQuery.error || !thread || !ArCabildoabiertoDataDataset.isDatasetView(thread.content)) return <ContentNotFoundPage/>

    return <DatasetPage
        dataset={thread.content}
    />
}

export default ContentPage
