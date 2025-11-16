import {useInfiniteQuery} from "@tanstack/react-query";
import {GetFeedProps} from "@/lib/types";
import {useEffect, useMemo} from "react";
import {unique} from "@cabildo-abierto/utils/dist/arrays";
import {VirtualItem} from "@tanstack/virtual-core";
import {FeedPage} from "@/components/feed/types";

export function useFeed<T>(
    getFeed: GetFeedProps<T>,
    queryKey: string[],
    enabled: boolean,
    getFeedElementKey: (e: T) => string,
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
        const elements = feed?.pages.reduce((acc, page) => [...acc, ...page.data], []) || []
        return unique(elements, getFeedElementKey) // TO DO (!): No debería hacer falta
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
}