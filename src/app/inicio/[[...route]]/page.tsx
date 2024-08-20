"use client"
import React from "react"
import { ThreeColumnsLayout } from "@/components/three-columns";
import { entityInRoute, WikiCategories } from "@/components/wiki-categories";
import Feed from "@/components/feed";
import { useFeed } from "@/app/hooks/contents";
import { CategoryArticles } from "@/components/category-articles";
import { useEntities } from "@/app/hooks/entities";


const TopicsPage: React.FC<{
    params: {route: string[]}
}> = ({params}) => {

    const decodedRoute = params.route ? params.route.map(decodeURIComponent) : []

    let feed = useFeed()
    const entities = useEntities()

    if(feed.feed){
        feed.feed = feed.feed.filter(({entityReferences}) => {
            return entityReferences.some((entity) => {
                return entityInRoute(entity, decodedRoute)
            }) || decodedRoute.length == 0
        })
    }

    const category = decodedRoute.length > 0 ? decodedRoute.join(" > ") : "Inicio"

    if(entities.isLoading){
        return <></>
    }
    if(!entities || entities.isError){
        return <>Ocurrió un error :(</>
    }

    const routeEntities = entities.entities.filter((entity) => (entityInRoute(entity, decodedRoute)))

    const center = <div className="w-full">
        <WikiCategories route={decodedRoute}/>
        <CategoryArticles entities={routeEntities}/>

        <h3 className="flex ml-2 py-4">Discusión</h3>
        {feed && <Feed feed={feed}/>}
    </div>

    return <ThreeColumnsLayout center={center} />
}
export default TopicsPage