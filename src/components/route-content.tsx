"use client"
import React, { useEffect, useState } from "react"
import { CategoryArticles } from "./category-articles";
import { CategoryUsers } from "./category-users";
import { useRouteFeed, useRouteFollowingFeed } from "../app/hooks/contents";
import { preload } from "swr";
import { fetcher } from "../app/hooks/utils";
import { MainFeedHeader } from "./main-feed-header";
import { ConfiguredFeed } from "./sorted-and-filtered-feed";
import { useUser } from "../app/hooks/user";
import { CreateAccountLink } from "./create-account-link";


type RouteContentProps = {
    route: string[],
    setRoute: (v: string[]) => void
    paramsSelected?: string
    showRoute?: boolean
}


export const RouteContent = ({route, setRoute, paramsSelected, showRoute=true}: RouteContentProps) => {
    const [selected, setSelected] = useState(paramsSelected ? paramsSelected : "General")
    const feed = useRouteFeed(route)
    const followingFeed = useRouteFollowingFeed(route)
    const [order, setOrder] = useState(selected == "General" ? "Recientes" : "Recientes")
    const [filter, setFilter] = useState("Todas")
    const user = useUser()

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
        if(v == "General" && order != "Recientes") setOrder("Recientes")
    }

    return <div className="w-full">
        <MainFeedHeader
            route={route}
            setRoute={setRoute}
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
                <CategoryArticles route={route}/>
            }

            {/*selected == "General" &&
                <div className="text-center mt-1 mb-2">
                    <span className="text-[var(--text-light)] text-sm">
                        Un muro con lo que está pasando en Cabildo Abierto, sin personalización
                    </span>
                </div>*/
            }
            
            {selected == "General" &&
                <ConfiguredFeed
                feed={feed}
                order={order}
                filter={filter}
            />}

            {selected == "Siguiendo" &&
            ((user.isLoading || user.user) ? <ConfiguredFeed
                feed={followingFeed}
                order={order}
                filter={filter}
            /> : <div className="flex justify-center mt-8"><CreateAccountLink
                text="Creá una cuenta o iniciá sesión para tener tu muro personal"
            /></div>)}

            {selected == "Usuarios" && <CategoryUsers route={route}/>}
        </div>
    </div>
}