"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation";
import { CategoryArticles } from "./category-articles";
import { CategoryUsers } from "./category-users";
import { RouteFeed } from "./route-feed";
import SelectionComponent from "./search-selection-component";
import { WikiCategories } from "./wiki-categories";
import { useRouteFeed, useRouteFollowingFeed } from "../app/hooks/contents";


type RouteContentProps = {
    route: string[], 
    paramsSelected?: string
}


export const RouteContent = ({route, paramsSelected}: RouteContentProps) => {
    const router = useRouter()
    const [selected, setSelected] = useState(paramsSelected ? paramsSelected : "General")
    const feed = useRouteFeed(route)
    const followingFeed = useRouteFollowingFeed(route)

    function onSelection(v: string){
        setSelected(v)
        router.push("/inicio/"+route.join("/")+"?selected="+v, {scroll: false})
    }

    return <div className="w-full">
        <div className="content-container pt-2 mt-2">
            <WikiCategories route={route} selected={selected}/>
            <SelectionComponent
                onSelection={onSelection}
                options={["General", "Siguiendo", "Artículos públicos", "Usuarios"]}
                selected={selected}
                className="main-feed"
            />
        </div>
        
        <div className="pt-2">
        {selected == "Artículos públicos" && 
        <CategoryArticles route={route}/>}

        {selected == "General" &&
        <RouteFeed
            feed={feed}
            defaultOrder="Populares"
        />}

        {selected == "Siguiendo" &&
        <RouteFeed
            feed={followingFeed}
            defaultOrder="Recientes"
        />}

        {selected == "Usuarios" && <CategoryUsers route={route}/>}
        </div>
    </div>
}