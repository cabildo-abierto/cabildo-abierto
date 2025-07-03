import {GetFeedProps} from "@/lib/types";
import {ReactNode, useCallback} from "react";
import Feed from "./feed";

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
    const getFeed = useCallback<GetFeedProps<T>>(async (cursor: string | undefined) => {
        if (!cursor) {
            return {
                data: {
                    feed: initialContents,
                    cursor: undefined
                }
            };
        } else {
            throw new Error(`Cursor inválido: ${cursor}`);
        }
    }, [initialContents]);

    return <Feed
        loadWhenRemaining={loadWhenRemaining}
        noResultsText={noResultsText}
        endText={endText}
        FeedElement={FeedElement}
        LoadingFeedContent={LoadingFeedContent}
        queryKey={queryKey}
        getFeed={getFeed}
        getFeedElementKey={getFeedElementKey}
    />
}

export default StaticFeed