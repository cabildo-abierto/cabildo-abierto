"use client"

import { useState, useEffect } from "react"
import { CreateAccountLink } from "./create-account-link"
import { MainFeedHeader } from "./main-feed-header"
import { useSearch } from "./search-context"
import { ConfiguredFeed } from "./sorted-and-filtered-feed"
import { useRouteFeed, useRouteFollowingFeed } from "../app/hooks/contents"
import { useUser } from "../app/hooks/user"
import { fetcher } from "../app/hooks/utils"
import { preload } from "swr"
import { TrendingArticles } from "./trending-articles"
import { TutorialPopup } from "./tutorial-popup"
import { FollowSuggestions } from "./follow-suggestions"
import { Route } from "./wiki-categories"


type MainPageProps = {
    route: string[],
    setRoute: (v: string[]) => void
    paramsSelected?: string
    showRoute?: boolean
}


export const MainPage = ({route, setRoute, paramsSelected, showRoute=true}: MainPageProps) => {
    const [selected, setSelected] = useState(paramsSelected ? paramsSelected : "Siguiendo")
    const feed = useRouteFeed(route)
    const followingFeed = useRouteFollowingFeed(route)

    const [order, setOrder] = useState(selected == "En discusión" ? "Populares" : "Recientes")
    const [filter, setFilter] = useState("Todas")
    const user = useUser()
    const [closedIntroPopup, setClosedIntroPopup] = useState(false)

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
        {user.user != undefined && !closedIntroPopup && <TutorialPopup onClose={() => {setClosedIntroPopup(true)}}/>}
        
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

            {false && showRoute && selected == "En discusión" && 
                <div className="flex items-center px-2 mt-2">
                    <Route route={route} setRoute={setRoute} selected={selected}/>
                </div>
            }
            
            {selected == "En discusión" && 
                <div className="pt-4 pb-6">
                    <TrendingArticles route={route}/>
                </div>
            }

            {selected == "En discusión" &&
                <ConfiguredFeed
                    feed={feed}
                    order={order}
                    filter={filter}
                    setFilter={setFilter}
                    setOrder={setOrder}
                />
            }

            {selected == "Siguiendo" && 
            <div className="">
                <FollowSuggestions/>
                </div>
            }

            {selected == "Siguiendo" &&
            ((user.isLoading || user.user) ? <div className="mt-4">
                <ConfiguredFeed
                    feed={followingFeed}
                    order={order}
                    setOrder={setOrder}
                    filter={filter}
                    setFilter={setFilter}
                    noResultsText={noResultsTextFollowing}
            /></div> : <div className="flex justify-center mt-8"><CreateAccountLink
                text="Creá una cuenta o iniciá sesión para tener tu muro personal."
            /></div>)}
        </div>
    </div>
}