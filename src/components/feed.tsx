import React, { useState } from "react"
import { ContentWithCommentsFromId } from "./content-with-comments";
import { NoResults } from "./category-users";
import { SmallContentProps } from "../app/lib/definitions";
import LoadingSpinner from "./loading-spinner";
import { ToggleButton } from "./toggle-button";

export type LoadingFeed = {feed: SmallContentProps[], isLoading: boolean, isError: boolean}

export type FeedProps = {
    feed: LoadingFeed,
    noResultsText?: string,
    maxSize?: number
}

const Feed: React.FC<FeedProps> = ({feed, maxSize, noResultsText="No se encontró ninguna publicación."}) => {
    const [range, setRange] = useState(maxSize)

    if(feed.isLoading){
        return <LoadingSpinner/>
    }
    
    let content = null
    if(feed.feed.length == 0){
        content = <NoResults text={noResultsText}/>
    } else {
        content = <>
            {feed.feed.slice(0, range ? range : feed.feed.length).map((feedContent, index: number) => {
                return <div key={index} className="w-full">
                    <ContentWithCommentsFromId
                        contentId={feedContent.id}
                        inCommentSection={false}
                    />
                </div>
            })}
            {maxSize && <div className="flex justify-center">
                <button className="hover:text-[var(--primary)]" onClick={() => {setRange(range+maxSize)}}>Ver más</button>
            </div>}
        </>
    }

    return <div className="h-full w-full flex flex-col items-center space-y-2">
        {content}
    </div>
}

export default Feed