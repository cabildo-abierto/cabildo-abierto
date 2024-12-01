import React, { ReactNode } from "react"
import { NoResults } from "./category-users";
import { FeedContentProps } from "../app/lib/definitions";
import LoadingSpinner from "./loading-spinner";
import { LazyLoadFeed } from "./lazy-load-feed";
import { ATProtoFastPost } from "./feed/atproto-fast-post";
import { ATProtoArticle } from "./feed/atproto-article";
import { ATProtoArticlePreview } from "./feed/atproto-article-preview";
import { ATProtoFastPostPreview } from "./feed/atproto-fast-post-preview";


export type LoadingFeed = {feed: FeedContentProps[], isLoading: boolean, isError: boolean}
export type LoadingFeedWithData = {feed: FeedContentProps[], isLoading: boolean, isError: boolean}


export type FeedProps = {
    feed: LoadingFeed,
    noResultsText?: ReactNode
}

const Feed: React.FC<FeedProps> = ({feed, noResultsText="No se encontró ninguna publicación."}) => {
    if(feed.isLoading){
        return <LoadingSpinner/>
    }

    function generator(index: number){
        let node
        if(feed.feed[index].record.$type == "app.ca.article.post"){
            node = <ATProtoArticlePreview
                content={feed.feed[index]}
            />
        } else {
            node = <ATProtoFastPostPreview
                content={feed.feed[index]}
            />
        }
        return {
            c: node,
            key: feed.feed[index].uri
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