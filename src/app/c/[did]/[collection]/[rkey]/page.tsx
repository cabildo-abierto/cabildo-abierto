"use client"
import {Thread} from "../../../../../components/feed/thread";
import LoadingSpinner from "../../../../../components/ui-utils/loading-spinner";
import {useThread} from "../../../../../hooks/contents";
import {ErrorPage} from "../../../../../components/ui-utils/error-page";
import React from "react";
import {getUri, shortCollectionToCollection} from "../../../../../components/utils/uri";


const ContentPage = ({params}: {
    params: Promise<{did: string, collection: string, rkey: string
}>}) => {
    const {did, collection, rkey} = React.use(params)

    const uri = getUri(decodeURIComponent(did), shortCollectionToCollection(collection), rkey)

    const thread = useThread(uri)

    if(thread.error) return <ErrorPage>{thread.error}</ErrorPage>

    if(!thread.thread) return <div className={"mt-8"}><LoadingSpinner/></div>
    return <Thread thread={thread.thread}/>
}

export default ContentPage
