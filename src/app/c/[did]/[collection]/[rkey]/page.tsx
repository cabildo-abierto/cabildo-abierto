"use client"
import {Thread} from "../../../../../components/feed/thread";
import LoadingSpinner from "../../../../../components/loading-spinner";
import {useThread} from "../../../../../hooks/contents";
import {ErrorPage} from "../../../../../components/error-page";


const ContentPage: React.FC<{params: {did: string, rkey: string}}> = ({params}) => {
    const thread = useThread({did: decodeURIComponent(params.did), rkey: params.rkey})

    if(thread.error) return <ErrorPage>{thread.error}</ErrorPage>

    if(!thread.thread) return <div className={"mt-8"}><LoadingSpinner/></div>

    return <Thread thread={thread.thread}/>
}

export default ContentPage
