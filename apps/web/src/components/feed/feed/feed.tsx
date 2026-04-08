"use client"
import React, {useRef} from "react"
import {useWindowVirtualizer} from "@tanstack/react-virtual"
import {FeedProps} from "./types"
import {useFeed, useFetchNextPage} from "./use-feed"
import {LoadingFeed} from "./loading-feed"
import {FeedEndText} from "./feed-end-text"
import {defaultFeedMerger} from "@/components/feed/feed/feed-merger"

function Feed<T>({
                     getFeed,
                     queryKey,
                     noResultsText,
                     endText,
                     getFeedElementKey,
                     LoadingFeedContent,
                     FeedElement,
                     enabled = true,
                     estimateSize = 400,
                     overscan = 6,
                     startContent,
                     isLoadingStartContent,
                     loadingStartContent,
                     feedMerger = defaultFeedMerger,
                     endTextClassName
                 }: FeedProps<T>) {

    const {
        data: feed,
        fetchNextPage,
        loading,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        feedList
    } = useFeed(getFeed, queryKey, enabled, getFeedElementKey, feedMerger)

    const hasStart = startContent != null
    const feedStartIndex = hasStart ? 1 : 0
    const feedEndIndex = feedStartIndex + feedList.length
    const totalCount = feedEndIndex + 1 // + end slot

    const sizeMap = useRef<Map<number, number>>(new Map())

    const virtualizer = useWindowVirtualizer({
        count: totalCount,
        estimateSize: (index) => sizeMap.current.get(index) ?? estimateSize,
        overscan
    })

    const items = virtualizer.getVirtualItems()

    useFetchNextPage(
        feedList,
        items,
        fetchNextPage,
        isFetchingNextPage,
        isFetching,
        hasNextPage,
        isLoadingStartContent
    )

    const measure = (index: number, el: HTMLElement | null) => {
        if (!el) return
        const height = el.getBoundingClientRect().height
        if (sizeMap.current.get(index) !== height) {
            sizeMap.current.set(index, height)
            virtualizer.measureElement(el)
        }
    }

    return (
        <div
            className="relative w-full"
            style={{height: virtualizer.getTotalSize()}}
        >
            <div
                className="absolute top-0 left-0 w-full"
                style={{
                    transform: `translateY(${items[0]?.start ?? 0}px)`
                }}
            >
                {items.map((virtualRow) => {
                    const index = virtualRow.index

                    const isStart = hasStart && index === 0
                    const isEnd = index === totalCount - 1
                    const feedIndex = index - feedStartIndex

                    let content: React.ReactNode = null
                    let key: string

                    if (isStart) {
                        key = "start"
                        content = isLoadingStartContent
                            ? loadingStartContent
                            : startContent
                    } else if (isEnd) {
                        key = "end"
                        content = (
                            <>
                                {loading && (
                                    <LoadingFeed loadingFeedContent={LoadingFeedContent}/>
                                )}
                                {feed && !hasNextPage && (endText || noResultsText) && (
                                    <FeedEndText
                                        text={feedList.length > 0 ? endText : noResultsText}
                                        className={endTextClassName}
                                    />
                                )}
                            </>
                        )
                    } else {
                        const item = feedList[feedIndex]
                        key = getFeedElementKey(item)

                        content = (
                            <FeedElement
                                content={item}
                                index={feedIndex}
                            />
                        )
                    }

                    return (
                        <div
                            key={key}
                            data-index={index}
                            ref={(el) => measure(index, el)}
                        >
                            {content}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Feed