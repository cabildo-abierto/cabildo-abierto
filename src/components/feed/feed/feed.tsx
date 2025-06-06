"use client"
import React, {ReactNode, useEffect} from "react";
import {getObjectKey, range} from "@/utils/arrays";
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
    noResultsText: string
    endText: string
    getFeed: GetFeedProps<T>
    LoadingFeedContent?: ReactNode
    FeedElement: ({content}: { content: T }) => ReactNode
    queryKey: string[]
}


export type InfiniteFeed<T> = {
    pages: FeedPage<T>[]
}


export function serializeFeedPages<T>(feedPages: FeedPage<T>[]){
    return feedPages.reduce((prev, page) => [...prev, ...page.data], [] as T[])
}


export interface FeedPage<T> {
    data: T[];
    nextCursor?: string;
}


function Feed<T>({
                     getFeed,
                     queryKey,
                     loadWhenRemaining = 2000,
                     noResultsText,
                     endText,
                     LoadingFeedContent,
                     FeedElement
                 }: FeedProps<T>) {
    const qc = useQueryClient()

    const {data: feed, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, isFetched, isError} = useInfiniteQuery({
        queryKey,
        queryFn: async ({pageParam}) => {
            const {data, error} = await getFeed(pageParam == "start" ? undefined : pageParam);
            if (error) {
                throw new Error("Failed to fetch feed");
            }

            const newPage: FeedPage<T> = {
                data: data.feed,
                nextCursor: data.cursor
            }
            return newPage
        },
        getNextPageParam: (lastPage) => {
            return lastPage.data.length > 0 ? lastPage.nextCursor : undefined
        },
        initialPageParam: "start",
        staleTime: 1000 * 60 * 5
    })

    useEffect(() => {
        if (isFetched) {
            qc.removeQueries({ queryKey });
            qc.refetchQueries({ queryKey });
        }
    }, [getFeed]);

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
                return <div className={"w-full"} key={getObjectKey(c)}>
                    <FeedElement content={c}/>
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