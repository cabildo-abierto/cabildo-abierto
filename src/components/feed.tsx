import React from "react"
import { ContentWithCommentsFromId } from "./content-with-comments";
import { NoResults } from "./category-users";
import { SmallContentProps } from "../app/lib/definitions";
import LoadingSpinner from "./loading-spinner";
import { LazyLoadFeed } from "./lazy-load-feed";


export type LoadingFeed = {feed: {id: string}[], isLoading: boolean, isError: boolean}
export type LoadingFeedWithData = {feed: SmallContentProps[], isLoading: boolean, isError: boolean}


export type FeedProps = {
    feed: LoadingFeed,
    noResultsText?: string
}

const Feed: React.FC<FeedProps> = ({feed, noResultsText="No se encontró ninguna publicación."}) => {
    if(feed.isLoading){
        return <LoadingSpinner/>
    }

    function generator(index: number){
        return {
            c: <ContentWithCommentsFromId
                contentId={feed.feed[index].id}
                inCommentSection={false}
            />,
            key: feed.feed[index].id
        }
    }
    
    let content = null
    if(feed.feed.length == 0){
        content = <NoResults text={noResultsText}/>
    } else {
        content = <>
            <LazyLoadFeed
                maxSize={feed.feed.length}
                generator={generator}
            />
        </>
    }

    return <div className="h-full w-full flex flex-col items-center space-y-2">
        {content}
    </div>
}

export default Feed