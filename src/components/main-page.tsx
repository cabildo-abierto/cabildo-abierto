"use client"

import { useState } from "react"
import { MainFeedHeader } from "./main-feed-header"
import { useFeed } from "../hooks/contents"
import { useUser } from "../hooks/user"
import { TrendingArticles } from "./trending-articles"
import { Route } from "./wiki-categories"
import Feed from "./feed/feed"


type MainPageProps = {
    route: string[],
    setRoute: (v: string[]) => void
    paramsSelected?: string
    showRoute?: boolean
}


export const MainPage = ({route, setRoute, paramsSelected, showRoute=true}: MainPageProps) => {
    const user = useUser()
    const [selected, setSelected] = useState(paramsSelected ? paramsSelected : (user.user ? "Siguiendo" : "En discusión"))
    const feed = null //useFeed(route, "InDiscussion")
    const followingFeed = useFeed(route, "Following")

    const [order, setOrder] = useState(selected == "En discusión" ? "Populares" : "Recientes")
    const [filter, setFilter] = useState("Todas")

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

            <div className="pt-4 pb-6 border-b">
                <TrendingArticles route={route} selected={selected}/>
            </div>

            {/*selected == "En discusión" && <Feed
                feed={feed}
            />*/}

            {selected == "Siguiendo" && <Feed
                feed={followingFeed}
            />}

            {/*(selected == "En discusión" || selected == "Siguiendo") &&
                <ConfiguredFeed
                    feed={feed}
                    order={order}
                    filter={filter}
                    setFilter={setFilter}
                    setOrder={setOrder}
                />
            */}

            {/*selected == "Siguiendo" &&
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
            /></div>)*/}
        </div>
    </div>
}