"use client"
import React, { useState } from "react"
import { ThreeColumnsLayout } from "@/components/three-columns";
import { entityInRoute, WikiCategories } from "@/components/wiki-categories";
import Feed from "@/components/feed";
import { useFeed, useFollowingFeed } from "@/app/hooks/contents";
import { CategoryArticles } from "@/components/category-articles";
import { useEntities } from "@/app/hooks/entities";
import SelectionComponent from "@/components/search-selection-component";
import { useUser } from "@/app/hooks/user";
import { useRouter } from "next/navigation";



const TopicsPage: React.FC<{
    params: {route: string[]}
    searchParams: { [key: string]: string }
}> = ({params, searchParams}) => {
    const decodedRoute = params.route ? params.route.map(decodeURIComponent) : []
    let selected = searchParams.selected ? searchParams.selected : "General"
    
    let {user} = useUser()
    let feed = useFeed()
    let followingFeed = useFollowingFeed(user.id)
    const router = useRouter()
    const entities = useEntities()

    if(feed.feed){
        feed.feed = feed.feed.filter(({entityReferences}) => {
            return entityReferences.some((entity) => {
                return entityInRoute(entity, decodedRoute)
            }) || decodedRoute.length == 0
        })
    }

    if(entities.isLoading){
        return <></>
    }
    if(!entities || entities.isError){
        return <>Ocurrió un error :(</>
    }

    const routeEntities = entities.entities.filter((entity) => (entityInRoute(entity, decodedRoute)))
    
    function setSelected(value: string) {
        router.push("/inicio/"+decodedRoute.join("/")+"?selected="+value)
    }

    const center = <div className="w-full">
        <div className="border rounded my-1">
            <WikiCategories route={decodedRoute} selected={selected}/>
            <SelectionComponent
                onSelection={setSelected}
                options={["General", "Siguiendo", "Artículos colaborativos"]}
                selected={selected}
                className="main-feed"
            />
        </div>

        {selected == "Artículos colaborativos" ? 
            <CategoryArticles entities={routeEntities}/> :
        selected == "General" ? 
        <>{feed && <div className="">
            <Feed feed={feed}/>
        </div>}</> : 
        <>{followingFeed && <div className="mt-8"><Feed feed={followingFeed}/></div>}</>}
    </div>

    return <ThreeColumnsLayout center={center} />
}
export default TopicsPage