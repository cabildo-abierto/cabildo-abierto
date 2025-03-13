"use client"
import {Thread} from "../../../../../components/feed/thread";
import LoadingSpinner from "../../../../../components/ui-utils/loading-spinner";
import {useThread} from "../../../../../hooks/contents";
import {ErrorPage} from "../../../../../components/ui-utils/error-page";
import React from "react";


const ContentPage = ({params}: {params: Promise<{did: string, rkey: string}>}) => {
    const {did, rkey} = React.use(params)
    const thread = useThread({did: did, rkey: rkey})

    if(thread.error) return <ErrorPage>{thread.error}</ErrorPage>

    if(!thread.thread) return <div className={"mt-8"}><LoadingSpinner/></div>

    return <Thread thread={thread.thread}/>
}

export default ContentPage
