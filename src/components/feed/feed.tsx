import React, { ReactNode } from "react"
import { NoResults } from "../category-users";
import { FeedContentProps } from "../../app/lib/definitions";
import LoadingSpinner from "../loading-spinner";
import { LazyLoadFeed } from "../lazy-load-feed";
import { ArticlePreview } from "./article-preview";
import { FastPostPreview } from "./fast-post-preview";
import {FeedElement} from "./feed-element";


export type LoadingFeed = {feed: FeedContentProps[], isLoading: boolean, isError: boolean}


export type FeedProps = {
    feed: LoadingFeed,
    noResultsText?: ReactNode
    showReplies?: boolean
}

const Feed: React.FC<FeedProps> = ({feed, noResultsText="No se encontró ninguna publicación.", showReplies=false}) => {
    if(feed.isLoading){
        return <LoadingSpinner/>
    }

    function generator(index: number){
        const node = <FeedElement elem={feed.feed[index]} showReplies={showReplies}/>
        return {
            c: node,
            key: feed.feed[index].uri
        }
    }
    
    let content = null
    if(feed.feed.length == 0){
        content = <NoResults text={noResultsText}/>
    } else {
        content = <div className="flex flex-col w-full">
            <LazyLoadFeed
                maxSize={feed.feed.length}
                generator={generator}
            />
            <div className="text-center w-full text-[var(--text-light)] pb-64 pt-6">
                Nada más por acá.
            </div>
        </div>
    }

    return <div className="h-full w-full flex flex-col items-center space-y-2">
        {content}
    </div>
}

export default Feed