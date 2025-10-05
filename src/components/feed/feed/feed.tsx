"use client"
import React, {ReactNode, useEffect, useMemo} from "react";
import {range} from "@/utils/arrays";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {GetFeedProps} from "@/lib/types";
import {useInfiniteQuery} from "@tanstack/react-query";
import { useWindowVirtualizer } from '@tanstack/react-virtual';

const LoadingFeed = ({loadingFeedContent}: { loadingFeedContent?: ReactNode }) => {
    if (!loadingFeedContent) {
        return <div className={"py-8"}>
            <LoadingSpinner/>
        </div>
    }
    return <div className={"flex flex-col space-y-1 w-full"}>
        {range(10).map(i => {
            return <div key={i}>
                {loadingFeedContent}
            </div>
        })}
    </div>
}


export type FeedProps<T> = {
    loadWhenRemaining?: number
    noResultsText: ReactNode
    endText: ReactNode
    getFeed: GetFeedProps<T>
    LoadingFeedContent?: ReactNode
    FeedElement: ({content, index}: { content: T, index?: number }) => ReactNode
    queryKey: string[]
    getFeedElementKey: (e: T) => string | null
    enabled?: boolean
    estimateSize?: number
}


export type InfiniteFeed<T> = {
    pages: FeedPage<T>[]
}

export interface FeedPage<T> {
    data: T[]
    nextCursor?: string
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
    estimateSize=500
}: FeedProps<T>) {
    const {data: feed, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching} = useInfiniteQuery({
        queryKey,
        queryFn: async ({pageParam}) => {
            const {data, error} = await getFeed(pageParam == "start" ? undefined : pageParam)
            if (error) {
                throw new Error("Failed to fetch feed")
            }
            const newPage: FeedPage<T> = {
                data: data.feed,
                nextCursor: data.cursor
            }
            return newPage
        },
        getNextPageParam: lastPage => {
            return lastPage.data.length > 0 ? lastPage.nextCursor : undefined
        },
        initialPageParam: "start",
        staleTime: 1000 * 60 * 5,
        enabled
    })

    const feedList = useMemo(() => {
        return feed?.pages.reduce((acc, page) => [...acc, ...page.data], []) || []
    }, [feed?.pages])

    const loading = isFetchingNextPage || (isFetching && feedList.length == 0)

    const virtualizer = useWindowVirtualizer({
        count: feedList.length+1,
        estimateSize: () => estimateSize,
        overscan: 4
    })

    const items = virtualizer.getVirtualItems()

    useEffect(() => {
        if(feedList.length == 0 || items.length == 0) return
        const lastItem = items[items.length - 1]

        if (
            lastItem.index >= feedList.length - 1 &&
            hasNextPage &&
            !isFetchingNextPage
        ) {
            fetchNextPage()
        }
    }, [
        hasNextPage,
        fetchNextPage,
        feedList.length,
        isFetchingNextPage,
        items
    ])

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


export default Feed