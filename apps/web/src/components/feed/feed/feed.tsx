"use client"
import React from "react";
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import {FeedProps} from "./types";
import {useFeed, useFetchNextPage} from "./use-feed";
import {LoadingFeed} from "./loading-feed";
import {FeedEndText} from "./feed-end-text";


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
    loadingStartContent
                         }: FeedProps<T>) {
    const {data: feed, fetchNextPage, loading, hasNextPage, isFetchingNextPage, feedList} = useFeed(
        getFeed, queryKey, enabled, getFeedElementKey)

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


export default Feed