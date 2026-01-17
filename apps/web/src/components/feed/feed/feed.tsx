"use client"
import React from "react";
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import {FeedProps} from "./types";
import {useFeed, useFetchNextPage} from "./use-feed";
import {LoadingFeed} from "./loading-feed";
import {FeedEndText} from "./feed-end-text";
import {defaultFeedMerger} from "@/components/feed/feed/feed-merger";


function VirtualizedFeed<T>({
                     getFeed,
                     queryKey,
                     noResultsText,
                     endText,
                     getFeedElementKey,
                     LoadingFeedContent,
                     FeedElement,
                     enabled=true,
                     estimateSize=500,
                     overscan=4,
                     startContent,
                     isLoadingStartContent,
                     loadingStartContent,
                     feedMerger=defaultFeedMerger
                 }: FeedProps<T>) {
    const {data: feed, fetchNextPage, loading, hasNextPage, isFetchingNextPage, feedList} = useFeed(
        getFeed,
        queryKey,
        enabled,
        getFeedElementKey,
        feedMerger
    )

    const count = feedList.length + 1 + (startContent ? 1 : 0)

    const virtualizer = useWindowVirtualizer({
        count,
        estimateSize: (i) => estimateSize,
        overscan
    })

    const items = virtualizer.getVirtualItems()

    useFetchNextPage(
        feedList,
        items,
        fetchNextPage,
        isFetchingNextPage,
        hasNextPage
    )

    return (
        <div
            className={"relative w-full"}
            style={{
                height: virtualizer.getTotalSize()
            }}
        >
            <div
                className={"absolute top-0 left-0 w-full "}
                style={{
                    transform: `translateY(${items[0]?.start ?? 0}px)`,
                }}
            >
                {items.map((c) => {
                    const isEnd = c.index == count-1
                    const isStart = c.index == 0 && startContent != null
                    const feedListIndex = c.index-(startContent ? 1 : 0)
                    return <div
                        key={isEnd ? "end" : isStart ? "start" : getFeedElementKey(feedList[feedListIndex])}
                        data-index={c.index}
                        ref={virtualizer.measureElement}
                    >
                        {isStart && (isLoadingStartContent ? loadingStartContent : startContent)}
                        {!isStart && !isLoadingStartContent && (!isEnd ?
                            <FeedElement content={feedList[feedListIndex]} index={feedListIndex}/> :
                            <div>
                                {loading &&
                                    <LoadingFeed loadingFeedContent={LoadingFeedContent}/>
                                }
                                {feed && !hasNextPage && (endText || noResultsText) && !hasNextPage &&
                                    <FeedEndText text={feedList.length > 0 ? endText : noResultsText}/>}
                            </div>)}
                    </div>

                })}
            </div>
        </div>
    )
}


function NonVirtualizedFeed<T>({
    getFeed,
    queryKey,
    noResultsText,
    endText,
    getFeedElementKey,
    LoadingFeedContent,
    FeedElement,
    enabled=true,
    estimateSize=500,
    overscan=4,
    startContent,
    isLoadingStartContent,
    loadingStartContent,
    feedMerger=defaultFeedMerger
}: FeedProps<T>) {
    let {
        data: feed,
        loading,
        hasNextPage,
        feedList,
    } = useFeed(
        getFeed,
        queryKey,
        enabled,
        getFeedElementKey,
        feedMerger
    )

    return <div className="w-full">
        {startContent && (
            <div>
                {isLoadingStartContent ? loadingStartContent : startContent}
            </div>
        )}

        {feedList.map((item, index) => (
            <FeedElement
                key={getFeedElementKey(item)}
                content={item}
                index={index}
            />
        ))}

        {loading && (
            <LoadingFeed loadingFeedContent={LoadingFeedContent} />
        )}

        {feed && !hasNextPage && (endText || noResultsText) && (
            <FeedEndText
                text={feedList.length > 0 ? endText : noResultsText}
            />
        )}
    </div>
}



function Feed<T>({
                     getFeed,
                     queryKey,
                     noResultsText,
                     endText,
                     getFeedElementKey,
                     LoadingFeedContent,
                     FeedElement,
                     enabled=true,
                     estimateSize=500,
                     overscan=4,
                     startContent,
                     isLoadingStartContent,
                     loadingStartContent,
                     feedMerger=defaultFeedMerger,
    virtualized=false,
}: FeedProps<T> & {virtualized?: boolean}) {

    if(virtualized) {
        return <VirtualizedFeed
            getFeed={getFeed}
            queryKey={queryKey}
            noResultsText={noResultsText}
            endText={endText}
            getFeedElementKey={getFeedElementKey}
            LoadingFeedContent={LoadingFeedContent}
            FeedElement={FeedElement}
            enabled={enabled}
            estimateSize={estimateSize}
            overscan={overscan}
            startContent={startContent}
            feedMerger={feedMerger}
        />
    } else {
        return <NonVirtualizedFeed
            getFeed={getFeed}
            queryKey={queryKey}
            noResultsText={noResultsText}
            endText={endText}
            getFeedElementKey={getFeedElementKey}
            LoadingFeedContent={LoadingFeedContent}
            FeedElement={FeedElement}
            enabled={enabled}
            estimateSize={estimateSize}
            overscan={overscan}
            startContent={startContent}
            feedMerger={feedMerger}
        />
    }
}


export default Feed