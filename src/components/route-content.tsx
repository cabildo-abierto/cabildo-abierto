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
import { WritePanelMainFeed } from "./write-panel-main-feed";
import { useSearch } from "./search-context";
import { articleUrl } from "./utils";
import Link from "next/link";


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
    const {searchValue} = useSearch()

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
        {(!user.user || user.user._count.views == 0) && <div className="flex justify-center mt-2">
            <Link
                href={articleUrl("Cabildo_Abierto")}
                className="gray-btn text-[var(--background)] title text-sm"
            >
                <div className="py-2 text-center">
                    Introducción a Cabildo Abierto
                </div>
            </Link>
        </div>}
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

            {(selected == "General" || selected == "Siguiendo") && searchValue.length == 0 && 
                <div className="mb-2 mt-1">
                <WritePanelMainFeed/>
                </div>
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
                noResultsText={<div className="text-sm"><div>No se encontró ninguna publicación.</div>
                    <div>Seguí a más personas para encontrar más contenidos en esta sección.</div>
                </div>}
            /> : <div className="flex justify-center mt-8"><CreateAccountLink
                text="Creá una cuenta o iniciá sesión para tener tu muro personal"
            /></div>)}

            {selected == "Usuarios" && <CategoryUsers route={route}/>}
        </div>
    </div>
}