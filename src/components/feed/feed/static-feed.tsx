import {GetFeedProps} from "@/lib/types";
import {ReactNode, useCallback, useEffect} from "react";
import Feed, {FeedPage} from "./feed";
import {InfiniteData, useQueryClient} from "@tanstack/react-query";

export type StaticFeedProps<T> = {
    loadWhenRemaining?: number
    noResultsText: ReactNode
    endText: string
    initialContents: T[]
    LoadingFeedContent?: ReactNode
    FeedElement: ({content, index}: { content: T, index?: number }) => ReactNode
    queryKey: string[]
    getFeedElementKey: (e: T) => string | null
}

function StaticFeed<T>({
                           loadWhenRemaining,
                           noResultsText,
                           endText,
                           initialContents,
                           LoadingFeedContent,
                           FeedElement,
                           queryKey,
                           getFeedElementKey
                       }: StaticFeedProps<T>) {
    const qc = useQueryClient()

    useEffect(() => {
        if(initialContents) {
            const page: FeedPage<T> = {
                data: initialContents,
                nextCursor: undefined
            }
            const data: InfiniteData<FeedPage<T>> = {
                pages: [page],
                pageParams: ["start"]
            }
            qc.setQueryData(queryKey, old => {
                return data
            })
        }
    }, [initialContents, qc, queryKey])

    const getFeed = useCallback<GetFeedProps<T>>(async (cursor: string | undefined) => {
        if (!cursor) {
            return {
                data: {
                    feed: [],
                    cursor: undefined
                }
            };
        } else {
            throw new Error(`Cursor inválido: ${cursor}`);
        }
    }, [])

    return <Feed
        loadWhenRemaining={loadWhenRemaining}
        noResultsText={noResultsText}
        endText={endText}
        FeedElement={FeedElement}
        LoadingFeedContent={LoadingFeedContent}
        queryKey={queryKey}
        getFeed={getFeed}
        getFeedElementKey={getFeedElementKey}
        enabled={false}
    />
}

export default StaticFeed