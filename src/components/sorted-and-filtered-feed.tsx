import { ReactNode } from "react"
import { SmallContentProps } from "../app/lib/definitions"
import { decompress } from "./compression"
import Feed, { LoadingFeedWithData } from "./feed"
import LoadingSpinner from "./loading-spinner"
import { useSearch } from "./search-context"
import { cleanText } from "./utils"
import { WritePanelMainFeed } from "./write-panel-main-feed"
import SelectionComponent from "./search-selection-component"
import { FastAndPostIcon, FastPostIcon, PostIcon } from "./icons"

function popularityScore(content: SmallContentProps){
    const commentators = new Set(content.childrenTree.map(({authorId}) => (authorId)))
    commentators.delete(content.author.id)
    return (content._count.reactions + commentators.size) / Math.max(content.uniqueViewsCount, 1)
}

function comp(a: {score: number}, b: {score: number}){
    return b.score - a.score
}

export type ConfiguredFeedProps = {
    feed: LoadingFeedWithData
    noResultsText?: ReactNode
    order: string
    filter: string
    setFilter: (v: string) => void 
}

export const ConfiguredFeed = ({feed, noResultsText, order, filter, setFilter}: ConfiguredFeedProps) => {
    const {searchValue} = useSearch()

    if(feed.isLoading){
        return <LoadingSpinner/>
    }

    function satisfiesSearch(c: SmallContentProps){
        const value = cleanText(searchValue)
        
        const text = cleanText(decompress(c.compressedPlainText))

        return text.includes(value) || 
            (c.title && cleanText(c.title).includes(value)) ||
            cleanText(c.author.name).includes(value) || 
            cleanText(c.author.id).includes(value)
    }

    let filteredFeed = searchValue.length > 0 ? feed.feed.filter(satisfiesSearch) : feed.feed

    if(filteredFeed && filter == "Rápidas"){
        filteredFeed = filteredFeed.filter((content) => (content.type == "FastPost"))
    }
    if(filteredFeed && filter == "Publicaciones"){
        filteredFeed = filteredFeed.filter((content) => (content.type == "Post"))
    }

    let feedWithScore = filteredFeed.map((content) => ({score: popularityScore(content), content: content}))
    
    const byPopularityFeed = feedWithScore.sort(comp).map(({content}) => (content))

    const popularityFeedComponent = <Feed feed={{feed: byPopularityFeed, isLoading: false, isError: false}} noResultsText={noResultsText}/>

    const recentFeedComponent = <Feed feed={{feed: filteredFeed, isLoading: false, isError: false}} noResultsText={noResultsText}/>

    return <>
        <div className="flex justify-center text-sm space-x-1 mb-2 mt-3">
            <div className="w-1/2 border-r rounded border-t border-b border-l">
            <SelectionComponent
                className="filter-feed"
                onSelection={setFilter}
                selected={filter}
                options={["Todas", "Rápidas", "Publicaciones"]}
                optionsNodes={[
                <div className="text-gray-900" key={0}><FastAndPostIcon/></div>,
                <div className="text-gray-900" key={1}><FastPostIcon/></div>,
                <div className="text-gray-900" key={2}><PostIcon/></div>]}
                optionExpl={["Todas las publicaciones", "Solo publicaciones rápidas", "Solo publicaciones con título"]}
            />
            </div>
        </div>
        {order == "Populares" && popularityFeedComponent}
        {order == "Recientes" && recentFeedComponent}
    </>
}
