import { SmallContentProps } from "../app/lib/definitions"
import Feed, { LoadingFeed } from "./feed"
import LoadingSpinner from "./loading-spinner"

// TO DO: Agregar la cantidad de personas distintas que comentaron
function popularityScore(content: SmallContentProps){
    return content._count.reactions
}


function comp(a: {score: number}, b: {score: number}){
    return b.score - a.score
}

export type ConfiguredFeedProps = {
    feed: LoadingFeed,
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
    // TO DO: Debería ser la versión parseada del texto y no diferencias mayus y min
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
