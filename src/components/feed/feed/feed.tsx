"use client"
import React, {ReactNode, useEffect} from "react";
import {range} from "@/utils/arrays";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {GetFeedProps} from "@/lib/types";
import {useInfiniteQuery, useQueryClient} from "@tanstack/react-query";


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
    endText: string
    getFeed: GetFeedProps<T>
    LoadingFeedContent?: ReactNode
    FeedElement: ({content, index}: { content: T, index?: number }) => ReactNode
    queryKey: string[]
    getFeedElementKey: (e: T) => string | null
    enabled?: boolean
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
    loadWhenRemaining = 2000,
    noResultsText,
    endText,
    LoadingFeedContent,
    FeedElement,
    getFeedElementKey,
    enabled=true
}: FeedProps<T>) {
    const {data: feed, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, isFetched, isError} = useInfiniteQuery({
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

    useEffect(() => {
        const handleScroll = async () => {
            if (isFetchingNextPage || isError || !hasNextPage) {
                return
            }

            const scrollTop = window.scrollY
            const viewportHeight = window.innerHeight
            const fullHeight = document.documentElement.scrollHeight

            const distanceFromBottom = fullHeight - (scrollTop + viewportHeight)

            if (distanceFromBottom < loadWhenRemaining) {
                await fetchNextPage()
            }
        };

        window.addEventListener('scroll', handleScroll)
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [getFeed, loadWhenRemaining, hasNextPage, isFetchingNextPage, isError, fetchNextPage])

    const feedList = feed?.pages.reduce((acc, page) => [...acc, ...page.data], []) || []

    return (
        <div className="w-full flex flex-col items-center">
            {feedList.map((c, i) => {
                const key = getFeedElementKey(c)
                return <div className={"w-full"} key={key+":"+i}>
                    <FeedElement content={c} index={i}/>
                </div>
            })}
            {(isFetchingNextPage || isFetching) &&
                <LoadingFeed loadingFeedContent={LoadingFeedContent}/>
            }
            {feed && <div className={"text-center py-16 text-[var(--text-light)]"}>
                {!hasNextPage && feedList.length > 0 && endText}
                {!hasNextPage && feedList.length == 0 && noResultsText}
            </div>}
        </div>
    )
}


export default Feed