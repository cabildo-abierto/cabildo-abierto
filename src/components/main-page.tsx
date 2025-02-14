"use client"

import { useState } from "react"
import { MainFeedHeader } from "./main-feed-header"
import Feed from "./feed/feed"
import {useFeed} from "../hooks/contents";


type MainPageProps = {
    paramsSelected?: string
    showRoute?: boolean
}


export const MainPage = ({paramsSelected, showRoute=true}: MainPageProps) => {
    const feed = useFeed([], "InDiscussion")
    const followingFeed = useFeed([], "Following")
    const [selected, setSelected] = useState(paramsSelected ? paramsSelected : "En discusión")

    const [order, setOrder] = useState(selected == "En discusión" ? "Populares" : "Recientes")
    const [filter, setFilter] = useState("Todas")

    function onSelection(v: string){
        setSelected(v)
        if(v == "Siguiendo" && order != "Recientes") setOrder("Recientes")
        if(v == "En discusión" && order != "Populares") setOrder("Populares")
    }

    return <div className="w-full mt-10">
        <div className={"fixed top-0 bg-[var(--background)] w-[598px] z-[1000]"}>
            <MainFeedHeader
                selected={selected}
                onSelection={onSelection}
                showRoute={showRoute}
                order={order}
                setOrder={setOrder}
                filter={filter}
                setFilter={setFilter}
            />
        </div>

        {selected == "En discusión" && <Feed
            feed={feed}
        />}

        {selected == "Siguiendo" && <Feed
            feed={followingFeed}
        />}
    </div>
}