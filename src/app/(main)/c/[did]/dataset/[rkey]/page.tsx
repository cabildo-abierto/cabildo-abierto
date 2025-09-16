"use client"
import {useThreadWithNormalizedContent} from "@/queries/useThread";
import {ErrorPage} from "../../../../../../../modules/ui-utils/src/error-page";
import React from "react";
import {getUri, shortCollectionToCollection} from "@/utils/uri";
import {isDatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {LoadingThread} from "@/components/thread/post/loading-thread";
import dynamic from "next/dynamic";
const DatasetPage = dynamic(() => import("@/components/datasets/dataset-page"), {
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

    if (threadQuery.error || !thread || !isDatasetView(thread.content)) return <ErrorPage>No se encontró el contenido.</ErrorPage>

    return <DatasetPage
        dataset={thread.content}
    />
}

export default ContentPage
