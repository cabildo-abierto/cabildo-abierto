"use client"
import React, { ReactNode } from "react"
import { FeedContentProps } from "@/lib/definitions";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import { LazyLoadFeed } from "./lazy-load-feed";
import {FeedElement} from "./feed-element";
import {NoResults} from "@/components/buscar/no-results";
import {ViewMonitor} from "../../../modules/ui-utils/src/view-monitor";
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";
import {FeedViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {isKnownContent} from "@/utils/type-utils";


export type LoadingFeed = {feed: FeedViewContent[], isLoading: boolean, error: string}


export type FeedProps = {
    feed: LoadingFeed,
    noResultsText?: ReactNode
    onClickQuote?: (cid: string) => void
    onDeleteFeedElem?: () => Promise<void>
}


export type FeedGenerator = (index: number) => {c: ReactNode, key: string} | null

const Feed = ({
    feed,
    noResultsText="No se encontró ninguna publicación.",
    onClickQuote,
    onDeleteFeedElem=async () => {},
}: FeedProps) => {
    if(feed.isLoading){
        return <div className={"pt-8"}><LoadingSpinner/></div>
    }
    if(!feed.feed){
        return <ErrorPage>{feed.error}</ErrorPage>
    }

    function generator(index: number): {c: ReactNode, key: string} | null {
        if(!isKnownContent(feed.feed[index].content)){
            console.log("Returning null for", feed.feed[index].content)
            return null
        }

        const node = (
            <ViewMonitor uri={feed.feed[index].content.uri}>
                <FeedElement
                    elem={feed.feed[index]}
                    onClickQuote={onClickQuote}
                    onDeleteFeedElem={onDeleteFeedElem}
                />
            </ViewMonitor>
        )
        return {
            c: node,
            key: (feed.feed[index].content.uri + " " + index.toString())
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