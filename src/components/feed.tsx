import React from "react"
import { ContentWithComments } from "./content-with-comments";
import { useUser } from "src/app/hooks/user";
import LoadingSpinner from "./loading-spinner";
import { NoResults } from "./category-users";


export type FeedProps = {
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
    return <div className="h-full w-full flex flex-col items-center">
        {feed.feed.length > 0 ? feed.feed.map(({id}, index: number) => {
            return <div key={index} className="w-full">
                <ContentWithComments
                    contentId={id}
                />
            </div>
        }) : 
        <NoResults/>}
    </div>
}

export default Feed