"use client"

import { useState } from "react"
import { MainFeedHeader } from "./main-feed-header"
import { useFeed } from "../hooks/contents"
import { useUser } from "../hooks/user"
import { Route } from "./wiki-categories"
import Feed from "./feed/feed"


type MainPageProps = {
    paramsSelected?: string
    showRoute?: boolean
}


export const MainPage = ({paramsSelected, showRoute=true}: MainPageProps) => {
    const [selected, setSelected] = useState(paramsSelected ? paramsSelected : "En discusión")
    const feed = useFeed([], "InDiscussion")
    const followingFeed = useFeed([], "Following")

    const [order, setOrder] = useState(selected == "En discusión" ? "Populares" : "Recientes")
    const [filter, setFilter] = useState("Todas")

    function onSelection(v: string){
        setSelected(v)
        if(v == "Siguiendo" && order != "Recientes") setOrder("Recientes")
        if(v == "En discusión" && order != "Populares") setOrder("Populares")
    }

    return <div className="w-full">
        <MainFeedHeader
            selected={selected}
            onSelection={onSelection}
            showRoute={showRoute}
            order={order}
            setOrder={setOrder}
            filter={filter}
            setFilter={setFilter}
        />

        {selected == "En discusión" && <Feed
            feed={feed}
        />}

        {selected == "Siguiendo" && <Feed
            feed={followingFeed}
        />}
    </div>
}