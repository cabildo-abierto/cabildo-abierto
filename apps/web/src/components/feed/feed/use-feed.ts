import {useInfiniteQuery} from "@tanstack/react-query";
import {GetFeedProps} from "@/lib/types";
import {useEffect, useMemo, useRef} from "react";
import {VirtualItem} from "@tanstack/virtual-core";
import {FeedPage} from "@/components/feed/types";
import {FeedMerger} from "@/components/feed/feed/types";

export function useFeed<T>(
    getFeed: GetFeedProps<T>,
    queryKey: string[],
    enabled: boolean,
    getFeedElementKey: (e: T) => string,
    feedMerger: FeedMerger<T>
) {
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
        // ineficiente... se remergea desde el principio cada vez, pero no sé si importa
        return feed?.pages.reduce((acc: T[], page) => feedMerger(acc, page.data), []) || []
    }, [feed?.pages])

    const loading = isFetchingNextPage || (isFetching && feedList.length == 0)

    return {data: feed, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, loading, feedList}
}


export function useFetchNextPage<T>(
    feedList: T[],
    items: VirtualItem[],
    fetchNextPage: () => void,
    isFetchingNextPage: boolean,
    hasNextPage: boolean
) {
    const hasScrolledRef = useRef(false)

    useEffect(() => {
        const onScroll = () => {
            hasScrolledRef.current = true
        }

        window.addEventListener("scroll", onScroll, { once: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    useEffect(() => {
        if(feedList.length == 0 || items.length == 0) {
            if(hasNextPage && !isFetchingNextPage) {
                fetchNextPage()
            } else {
                return
            }
        }
        const lastItem = items[items.length - 1]

        if (
            lastItem.index >= feedList.length - 1 &&
            hasNextPage &&
            !isFetchingNextPage && hasScrolledRef.current
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
}