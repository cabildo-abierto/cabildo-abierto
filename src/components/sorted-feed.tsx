import { useState } from "react"
import { LoadingFeed, LoadingFeedWithData } from "./feed"
import SelectionComponent from "./search-selection-component"
import { ConfiguredFeed } from "./sorted-and-filtered-feed"


export type SortedFeedProps = {
    feed: LoadingFeedWithData,
    noResultsText?: string,
    maxSize?: number
    defaultOrder: string
}


export const FeedWithConfig = ({feed, noResultsText, maxSize, defaultOrder}: SortedFeedProps) => {
    const [order, setOrder] = useState(defaultOrder)
    const [filter, setFilter] = useState("Todas")

    return <div>
        <div className="flex justify-center text-sm mb-2 space-x-1">
            <div className="w-72 border">
            <SelectionComponent
                className="filter-feed"
                onSelection={setFilter}
                selected={filter}
                options={["Todas", "Rápidas", "Elaboradas"]}
                optionExpl={["Todas las publicaciones", "Solo publicaciones rápidas", "Solo publicaciones con título"]}
            />
            </div>
            <div className="w-72 border">
            <SelectionComponent
                className="filter-feed"
                onSelection={setOrder}
                selected={order}
                options={["Recientes", "Populares"]}
                optionExpl={["Publicaciones ordenadas por fecha de publicación", "Publicaciones ordenadas por cantidad de reacciones positivas."]}
            />
            </div>
        </div>
        <ConfiguredFeed
        feed={feed}
        noResultsText={noResultsText}
        maxSize={maxSize}
        order={order}
        filter={filter}/>
    </div>
}