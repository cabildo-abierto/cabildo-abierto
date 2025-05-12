"use client"
import LoadingSpinner from "../../../../../../../modules/ui-utils/src/loading-spinner";
import {useThread} from "@/hooks/api";
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
    const {data: thread, isLoading, error} = useThread(uri)

    if (isLoading) return <div className={"mt-8"}>
        <LoadingSpinner/>
    </div>

    if (error || !thread) return <ErrorPage>{error?.name}</ErrorPage>

    return <Thread thread={thread}/>
}

export default ContentPage
