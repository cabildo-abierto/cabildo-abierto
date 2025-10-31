"use client"
import React from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import {FeedProps} from "@/components/feed/feed/types";
import {useFeed, useFetchNextPage} from "./use-feed";
import {LoadingFeed} from "@/components/feed/feed/loading-feed";


type ContainedFeedProps<T> = FeedProps<T> & {
    parentContainer: HTMLElement
}


function ContainedFeed<T>({
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
    parentContainer
                 }: ContainedFeedProps<T>) {
    const {data: feed, fetchNextPage, loading, hasNextPage, isFetchingNextPage, feedList} = useFeed(
        getFeed, queryKey, enabled, getFeedElementKey,)

    const virtualizer = useVirtualizer({
        count: feedList.length+1,
        estimateSize: () => estimateSize,
        overscan,
        getScrollElement: () => {
            return parentContainer
        }
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
                    const isEnd = c.index > feedList.length - 1
                    return <div
                        key={isEnd ? "end" : getFeedElementKey(feedList[c.index])}
                        data-index={c.index}
                        ref={virtualizer.measureElement}
                    >
                        {!isEnd ?
                            <FeedElement content={feedList[c.index]} index={c.index}/> :
                            <div>
                                {loading &&
                                    <LoadingFeed loadingFeedContent={LoadingFeedContent}/>
                                }
                                {feed && !hasNextPage && (endText || noResultsText) && <div className={"text-center font-light py-16 text-[var(--text-light)] text-sm"}>
                                    {!hasNextPage && feedList.length > 0 && endText}
                                    {!hasNextPage && feedList.length == 0 && noResultsText}
                                </div>}
                            </div>}
                    </div>

                })}
            </div>
        </div>
    )
}


export default ContainedFeed