"use client"
import React, { ReactNode } from "react"
import { FeedContentProps } from "../../app/lib/definitions";
import LoadingSpinner from "../loading-spinner";
import { LazyLoadFeed } from "../lazy-load-feed";
import {FeedElement} from "./feed-element";
import {NoResults} from "../no-results";
import {ViewMonitor} from "../view-monitor";
import {ErrorPage} from "../error-page";


export type LoadingFeed = {feed: FeedContentProps[], isLoading: boolean, error: string}


export type FeedProps = {
    feed: LoadingFeed,
    noResultsText?: ReactNode
    showReplies?: boolean
    onClickQuote?: (cid: string) => void
}

const Feed: React.FC<FeedProps> = ({feed, noResultsText="No se encontró ninguna publicación.", showReplies=false, onClickQuote}) => {
    if(feed.isLoading){
        return <div className={"mt-8"}><LoadingSpinner/></div>
    }
    if(!feed.feed){
        return <ErrorPage>{feed.error}</ErrorPage>
    }

    function generator(index: number){
        const node = <ViewMonitor uri={feed.feed[index].uri}>
            <FeedElement elem={feed.feed[index]} onClickQuote={onClickQuote}/>
        </ViewMonitor>

        return {
            c: node,
            key: (feed.feed[index].uri + " " + index.toString())
        }
    }
    
    let content
    if(feed.feed.length == 0){
        content = <NoResults text={noResultsText}/>
    } else {
        content = <div className="flex flex-col w-full border-inherit">
            <LazyLoadFeed
                maxSize={feed.feed.length}
                generator={generator}
            />
            <div className="text-center w-full text-[var(--text-light)] pb-64 pt-6">
                Nada más por acá.
            </div>
        </div>
    }

    return <>
        {content}
    </>
}

export default Feed