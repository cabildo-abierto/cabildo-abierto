import { SmallContentProps } from "../app/lib/definitions"
import Feed, { LoadingFeed, LoadingFeedWithData } from "./feed"
import LoadingSpinner from "./loading-spinner"

// TO DO: Agregar la cantidad de personas distintas que comentaron
function popularityScore(content: SmallContentProps){
    return content._count.reactions + content._count.childrenTree
}


function comp(a: {score: number}, b: {score: number}){
    return b.score - a.score
}

export type ConfiguredFeedProps = {
    feed: LoadingFeedWithData,
    noResultsText?: string,
    maxSize?: number
    order: string
    filter: string
}

export const ConfiguredFeed = ({feed, noResultsText, maxSize, order, filter}: ConfiguredFeedProps) => {
    if(feed.isLoading){
        return <LoadingSpinner/>
    }

    let filteredFeed = feed.feed
    if(filteredFeed && filter == "Rápidas"){
        filteredFeed = filteredFeed.filter((content) => (content.type == "FastPost"))
    }
    if(filteredFeed && filter == "Elaboradas"){
        filteredFeed = filteredFeed.filter((content) => (content.type == "Post"))
    }

    let feedWithScore = filteredFeed.map((content) => ({score: popularityScore(content), content: content}))
    
    const byPopularityFeed = feedWithScore.sort(comp).map(({content}) => (content))

    const popularityFeedComponent = <Feed feed={{feed: byPopularityFeed, isLoading: false, isError: false}} noResultsText={noResultsText} maxSize={maxSize}/>

    const recentFeedComponent = <Feed feed={{feed: filteredFeed, isLoading: false, isError: false}} noResultsText={noResultsText} maxSize={maxSize}/>

    return order == "Populares" ? popularityFeedComponent : recentFeedComponent
}
