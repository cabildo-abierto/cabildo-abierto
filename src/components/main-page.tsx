"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { CreateAccountLink } from "./create-account-link"
import { MainFeedHeader } from "./main-feed-header"
import { useSearch } from "./search-context"
import { ConfiguredFeed } from "./sorted-and-filtered-feed"
import { useRouteFeed, useRouteFollowingFeed } from "../app/hooks/contents"
import { useUser } from "../app/hooks/user"
import { fetcher } from "../app/hooks/utils"
import { preload } from "swr"
import { WritePanelMainFeed } from "./write-panel-main-feed"
import { TrendingArticles } from "./trending-articles"


type MainPageProps = {
    route: string[],
    setRoute: (v: string[]) => void
    paramsSelected?: string
    showRoute?: boolean
}


export const MainPage = ({route, setRoute, paramsSelected, showRoute=true}: MainPageProps) => {
    const [selected, setSelected] = useState(paramsSelected ? paramsSelected : "En discusión")
    const feed = useRouteFeed(route)
    const followingFeed = useRouteFollowingFeed(route)
    const [order, setOrder] = useState(selected == "En discusión" ? "Populares" : "Recientes")
    const [filter, setFilter] = useState("Todas")
    const user = useUser()
    const {searchValue} = useSearch()
    const [closedIntroPopup, setClosedIntroPopup] = useState(false)
    const [writingFastPost, setWritingFastPost] = useState(false)

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
        if(v == "En discusión" && order != "Populares") setOrder("Populares")
    }

    const noResultsTextFollowing = <div className="text-sm">
        <div>No se encontró ninguna publicación.</div>
        <div>Seguí a más personas para encontrar más contenidos en esta sección.</div>
    </div>

    return <div className="w-full">
        {(!user.user || user.user._count.views == 0) && searchValue.length == 0 && !closedIntroPopup && <div className="flex justify-center mt-2">
            <div className="flex justify-center">
                <Link className="gray-btn" href="/articulo?i=Cabildo_Abierto">
                    Leer la presentación de Cabildo Abierto
                </Link>
            </div>
        </div>}

        {searchValue.length == 0 && 
            <div className="mb-2 mt-2">
                <WritePanelMainFeed/>
            </div>
        }
        
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
        
        <div className="">
            
            {selected == "En discusión" && 
                <div className="my-4">
                <TrendingArticles/>
                </div>
            }

            {selected == "En discusión" &&
                <ConfiguredFeed
                feed={feed}
                order={order}
                filter={filter}
                setFilter={setFilter}
            />}

            {selected == "Siguiendo" &&
            ((user.isLoading || user.user) ? <ConfiguredFeed
                feed={followingFeed}
                order={order}
                filter={filter}
                setFilter={setFilter}
                noResultsText={noResultsTextFollowing}
            /> : <div className="flex justify-center mt-8"><CreateAccountLink
                text="Creá una cuenta o iniciá sesión para tener tu muro personal"
            /></div>)}
        </div>
    </div>
}