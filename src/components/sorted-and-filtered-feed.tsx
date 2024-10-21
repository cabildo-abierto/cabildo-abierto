import { ReactNode } from "react"
import { SmallContentProps } from "../app/lib/definitions"
import { decompress } from "./compression"
import Feed, { LoadingFeedWithData } from "./feed"
import LoadingSpinner from "./loading-spinner"
import { useSearch } from "./search-context"
import { cleanText, listOrderDesc } from "./utils"
import InfoPanel from "./info-panel"
import SwapVertIcon from '@mui/icons-material/SwapVert';

function popularityScore(content: SmallContentProps){
    const commentators = new Set(content.childrenTree.map(({authorId}) => (authorId)))
    commentators.delete(content.author.id)

    const viewWeight = content.type == "FastPost" ? 0.4 : 1

    //const daysSinceCreation = (new Date().getTime() - new Date(content.createdAt).getTime()) / (1000*60*60*24)

    return [(content._count.reactions + commentators.size) / Math.max(content.uniqueViewsCount * viewWeight, 1)]
}
    
function isPopularEnough(content: SmallContentProps){
    const commentators = new Set(content.childrenTree.map(({authorId}) => (authorId)))
    commentators.delete(content.author.id)
    
    return content._count.reactions + commentators.size > 0
}

export type ConfiguredFeedProps = {
    feed: LoadingFeedWithData
    noResultsText?: ReactNode
    order: string
    filter: string
    setFilter: (v: string) => void
    maxCount?: number
}

export const ConfiguredFeed = ({feed, noResultsText, order, filter, setFilter, maxCount}: ConfiguredFeedProps) => {
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

    if(maxCount && maxCount < filteredFeed.length){
        filteredFeed = filteredFeed.slice(0, maxCount)
    }

    if(searchValue.length == 0 && order == "Populares")
        filteredFeed = filteredFeed.filter(isPopularEnough)

    let feedWithScore = filteredFeed.map((content) => ({score: popularityScore(content), content: content}))

    const byPopularityFeed = feedWithScore.sort(listOrderDesc).map(({content}) => (content))

    const popularityFeedComponent = <Feed feed={{feed: byPopularityFeed, isLoading: false, isError: false}} noResultsText={noResultsText}/>

    const recentFeedComponent = <Feed feed={{feed: filteredFeed, isLoading: false, isError: false}} noResultsText={noResultsText}/>

    const infoPopular = <div><p className="font-bold">Publicaciones ordenadas por popularidad</p>Se suman los votos hacia arriba y la cantidad de personas que comentaron y se lo divide por la cantidad de vistas.</div>

    function onOnlyPosts(){
        if(filter != "Publicaciones"){
            setFilter("Publicaciones")
        } else {
            setFilter("Todas")
        }
    }

    function onOnlyFastPosts(){
        if(filter != "Rápidas"){
            setFilter("Rápidas")
        } else {
            setFilter("Todas")
        }
    }

    return <>
        <div className="flex justify-between items-center">
            
            {feedWithScore.length > 0 && <div className="flex ml-1 space-x-1 mb-1">
                <button onClick={onOnlyFastPosts} className={"rounded-lg px-2 hover:bg-[var(--secondary-light)] bg-[var(--content)]  text-xs sm:text-sm text-[var(--text-light)] border " + (filter == "Rápidas" ? "bg-[var(--secondary-slight)]" : "")}>
                    solo rápidas
                </button>
                <button onClick={onOnlyPosts} className={"rounded-lg px-2 hover:bg-[var(--secondary-light)] bg-[var(--content)]  text-xs sm:text-sm text-[var(--text-light)] border " + (filter == "Publicaciones" ? "bg-[var(--secondary-slight)]" : "")}>
                    solo publicaciones
                </button>
            </div>}

        {order == "Populares" && searchValue.length == 0 && <InfoPanel iconClassName="text-gray-600" icon={<SwapVertIcon fontSize="small"/>} text={infoPopular}/>}

        {order == "Recientes" && searchValue.length == 0 && <InfoPanel iconClassName="text-gray-600" icon={<SwapVertIcon fontSize="small"/>} text="Publicaciones en orden cronológico inverso (primero las más recientes)"/>}
        </div>
        {order == "Populares" && popularityFeedComponent}
        {order == "Recientes" && recentFeedComponent}
    </>
}
