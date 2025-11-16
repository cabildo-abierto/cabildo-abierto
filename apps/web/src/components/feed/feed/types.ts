import {ReactNode} from "react";
import {GetFeedProps} from "@/lib/types";


export type FeedProps<T> = {
    startContent?: ReactNode
    isLoadingStartContent?: boolean
    loadingStartContent?: ReactNode
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