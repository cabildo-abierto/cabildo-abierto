import { ReactNode } from "react"
import { SmallContentProps } from "../app/lib/definitions"
import { decompress } from "./compression"
import Feed, { LoadingFeedWithData } from "./feed"
import LoadingSpinner from "./loading-spinner"
import { useSearch } from "./search-context"
import { cleanText } from "./utils"

function popularityScore(content: SmallContentProps){
    return (content._count.reactions + content.uniqueCommentators) / Math.max(content.uniqueViewsCount, 1)
}

function comp(a: {score: number}, b: {score: number}){
    return b.score - a.score
}

export type ConfiguredFeedProps = {
    feed: LoadingFeedWithData
    noResultsText?: ReactNode
    order: string
    filter: string
}

export const ConfiguredFeed = ({feed, noResultsText, order, filter}: ConfiguredFeedProps) => {
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
        {order == "Populares" && popularityFeedComponent}
        {order == "Recientes" && recentFeedComponent}
    </>
}
