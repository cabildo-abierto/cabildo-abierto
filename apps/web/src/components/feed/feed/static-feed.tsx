import React, {ReactNode} from "react";

export type StaticFeedProps<T> = {
    noResultsText: ReactNode
    endText: ReactNode
    initialContents: T[]
    FeedElement: ({content, index}: { content: T, index?: number }) => ReactNode
    getFeedElementKey: (e: T) => string | null
    startContent?: ReactNode
    isLoadingStartContent?: boolean
    loadingStartContent?: ReactNode
}

function StaticFeed<T>({
                           noResultsText,
                           endText,
                           initialContents,
                           FeedElement,
                           getFeedElementKey,
                           startContent,
                           isLoadingStartContent,
                           loadingStartContent
                       }: StaticFeedProps<T>) {

    return (
        <div className="w-full flex flex-col items-center">
            <div className={"w-full"}>
                {isLoadingStartContent ? loadingStartContent : startContent}
            </div>
            {initialContents && initialContents.map((c, i) => {
                const key = getFeedElementKey(c)
                return <div className={"w-full"} key={key + ":" + i}>
                    <FeedElement
                        content={c}
                        index={i}
                    />
                </div>
            })}
            {initialContents && (endText || noResultsText) &&
                <div className={"text-sm font-light text-center py-16 text-[var(--text-light)]"}>
                    {initialContents.length > 0 && endText}
                    {initialContents.length == 0 && noResultsText}
                </div>}
        </div>
    )
}

export default StaticFeed