import { useState } from "react"
import { LoadingFeed, LoadingFeedWithData } from "./feed"
import SelectionComponent from "./search-selection-component"
import { ConfiguredFeed } from "./sorted-and-filtered-feed"
import { FastPostIcon, PopularIcon, PostIcon, RecentIcon } from "./icons"


export type SortedFeedProps = {
    feed: LoadingFeedWithData,
    noResultsText?: string,
    maxSize?: number
    order: string
    filter: string
}


export const FeedWithConfig = ({feed, noResultsText, maxSize, order, filter}: SortedFeedProps) => {

    return <div>
        {order == "Recientes" &&
        <ConfiguredFeed
        feed={feed}
        noResultsText={noResultsText}
        maxSize={maxSize}
        order="Recientes"
        filter={filter}/>}

        {order == "Populares" &&
        <ConfiguredFeed
        feed={feed}
        noResultsText={noResultsText}
        maxSize={maxSize}
        order="Populares"
        filter={filter}/>}
    </div>
}