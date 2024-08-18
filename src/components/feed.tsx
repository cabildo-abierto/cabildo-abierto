import React from "react"
import { ContentWithComments } from "./content-with-comments";
import { UserProps } from '@/app/lib/definitions';
import { useContent } from "@/app/hooks/contents";
import { useUser } from "@/app/hooks/user";


function getOnlyFollowing(feed: {id: string}[], user: UserProps){
    return feed.filter(({id}) => {
        const {content, isLoading, isError} = useContent(id)
        return content && user.following.some((u) => u.id == content.author?.id)
    })
}


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