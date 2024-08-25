import React from "react"
import { ContentWithComments } from "./content-with-comments";
import { useUser } from "@/app/hooks/user";
import LoadingSpinner from "./loading-spinner";


type FeedProps = {
    feed: {id: string}[],
    isLoading: boolean,
    isError: boolean
}


const Feed: React.FC<{feed: FeedProps}> = ({feed}) => {
    const user = useUser()
    if(feed.isLoading || user.isLoading){
        return <LoadingSpinner/>
    }
    if(feed.isError){
        return <></>
    }
    return <div className="h-full w-full">
        {feed.feed.length > 0 ? feed.feed.map(({id}, index: number) => {
            return <div key={index} className="">
                <ContentWithComments
                    contentId={id}
                />
            </div>
        }) : 
        <div className="ml-4 mt-8 flex justify-center">Todavía no hay nada acá...</div>}
    </div>
}

export default Feed