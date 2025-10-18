import {ReactNode} from "react";
import {GetFeedProps} from "@/lib/types";

export type InfiniteFeed<T> = {
    pages: FeedPage<T>[]
}

export interface FeedPage<T> {
    data: T[]
    nextCursor?: string
}


export type FeedProps<T> = {
    startContent?: ReactNode
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
    overscan?: number
}