"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import { CategoryArticles } from "./category-articles";
import { CategoryUsers } from "./category-users";
import { RouteFeed } from "./route-feed";
import { useRouteFeed, useRouteFollowingFeed } from "../app/hooks/contents";
import { preload } from "swr";
import { fetcher } from "../app/hooks/utils";
import { MainFeedHeader } from "./main-feed-header";


type RouteContentProps = {
    route: string[], 
    paramsSelected?: string
    showRoute?: boolean
}


export const RouteContent = ({route, paramsSelected, showRoute=true}: RouteContentProps) => {
    const router = useRouter()
    const [selected, setSelected] = useState(paramsSelected ? paramsSelected : "General")
    const feed = useRouteFeed(route)
    const followingFeed = useRouteFollowingFeed(route)
    const [order, setOrder] = useState(selected == "General" ? "Populares" : "Siguiendo")
    const [filter, setFilter] = useState("Todas")

    useEffect(() => {
        preload("/api/users", fetcher)
        preload("/api/entities", fetcher)

        // probablemente estos dos no tenga sentido ponerlos acá
        preload("/api/feed/", fetcher)
        preload("/api/following-feed/", fetcher)
    }, [])

    function onSelection(v: string){
        setSelected(v)
        if(v == "Siguiendo" && order != "Recientes") setOrder("Recientes")
        if(v == "General" && order != "Populares") setOrder("Populares")
    }

    return <div className="w-full">
        <MainFeedHeader
            route={route}
            selected={selected}
            onSelection={onSelection}
            showRoute={showRoute}
            order={order}
            setOrder={setOrder}
            filter={filter}
            setFilter={setFilter}
        />
        
        <div className="pt-1">
            {selected == "Artículos públicos" && 
            <CategoryArticles route={route}/>}

        {selected == "General" &&
        <RouteFeed
            feed={feed}
            order={order}
            filter={filter}
        />}

        {selected == "Siguiendo" &&
        <RouteFeed
            feed={followingFeed}
            order={order}
            filter={filter}
        />}

        {selected == "Usuarios" && <CategoryUsers route={route}/>}
        </div>
    </div>
}