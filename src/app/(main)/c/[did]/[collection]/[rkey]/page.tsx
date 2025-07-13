"use client"
import LoadingSpinner from "../../../../../../../modules/ui-utils/src/loading-spinner";
import {useThreadWithNormalizedContent} from "@/queries/api";
import {ErrorPage} from "../../../../../../../modules/ui-utils/src/error-page";
import React from "react";
import {getUri, shortCollectionToCollection} from "@/utils/uri";
import dynamic from "next/dynamic";
const Thread = dynamic(() => import("@/components/thread/thread"), {ssr: false})


const ContentPage = ({params}: {
    params: Promise<{
        did: string, collection: string, rkey: string
    }>
}) => {
    const {did, collection, rkey} = React.use(params)
    const uri = getUri(decodeURIComponent(did), shortCollectionToCollection(collection), rkey)
    const {query: threadQuery, thread} = useThreadWithNormalizedContent(uri)

    if (threadQuery.isLoading) return <div className={"mt-8"}>
        <LoadingSpinner/>
    </div>

    if (threadQuery.error || !thread) return <ErrorPage>No se encontró el contenido.</ErrorPage>

    return <Thread thread={thread}/>
}

export default ContentPage
