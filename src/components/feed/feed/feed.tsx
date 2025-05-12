"use client"
import React, {ReactNode, useEffect, useState} from "react";
import {range} from "@/utils/arrays";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {GetFeedOutput, GetFeedProps} from "@/lib/types";
import {useInfiniteQuery} from "@tanstack/react-query";
import {isFeed} from "@/lex-api/types/app/bsky/feed/describeFeedGenerator";


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
    noResultsText: string
    endText: string
    getFeed: GetFeedProps<T>
    LoadingFeedContent?: ReactNode
    FeedElement: ({content}: { content: T }) => ReactNode
    queryKey: string[]
}


function Feed<T>({
                     getFeed,
                     queryKey,
                     loadWhenRemaining = 4000,
                     noResultsText,
                     endText,
                     LoadingFeedContent,
                     FeedElement
                 }: FeedProps<T>) {

    interface Page {
        data: T[];
        nextCursor?: string;
    }

    const {data: feed, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, isError} = useInfiniteQuery({
        queryKey,
        queryFn: async ({pageParam}) => {
            const {data, error} = await getFeed(pageParam == "start" ? undefined : pageParam);
            if (error) {
                throw new Error("Failed to fetch feed");
            }

            const newPage: Page = {
                data: data.feed,
                nextCursor: data.cursor
            }
            return newPage
        },
        getNextPageParam: (lastPage) => {
            return lastPage.nextCursor
        },
        initialPageParam: "start",
        staleTime: 1000 * 60 * 5
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

    const feedLength = feed?.pages.reduce((acc, page) => acc + page.data.length, 0) || 0

    return (
        <div className="w-full flex flex-col items-center">
            {feed && feed.pages.map(page => {
                return page.data.map((c, i) => {
                    return <div className={"w-full"} key={[page.nextCursor, i, ...queryKey].join(":")}>
                        <FeedElement content={c}/>
                    </div>
                })
            })}
            {(isFetchingNextPage || isFetching) &&
                <LoadingFeed loadingFeedContent={LoadingFeedContent}/>
            }
            {feed && <div className={"text-center py-16 text-[var(--text-light)]"}>
                {!hasNextPage && feedLength > 0 && endText}
                {!hasNextPage && feedLength == 0 && noResultsText}
            </div>}
        </div>
    );
}


export default Feed