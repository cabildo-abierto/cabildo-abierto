import React from "react"
import { ContentWithComments } from "./content-with-comments";
import { useUser } from "@/app/hooks/user";


type FeedProps = {
    feed: {id: string}[],
    isLoading: boolean,
    isError: boolean
}


const Feed: React.FC<{feed: FeedProps}> = ({feed}) => {
    const user = useUser()
    if(feed.isLoading || user.isLoading){
        return <></>
    }
    if(feed.isError){
        return <>Error :(</>
    }
    return <div className="h-full w-full">
        {feed.feed.map(({id}, index: number) => {
            return <div key={index} className="py-1">
                <ContentWithComments
                    contentId={id}
                />
            </div>
        })}
    </div>
}

export default Feed