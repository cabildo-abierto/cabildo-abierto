"use client"

import { useState } from "react"
import { MainFeedHeader } from "./main-feed-header"
import Feed from "../feed/feed"
import {useFeed} from "../../hooks/contents";
import {useRouter, useSearchParams} from "next/navigation";



export const MainPage = () => {
    const feed = useFeed("InDiscussion")
    const followingFeed = useFeed("Following")
    const params = useSearchParams()
    const paramsFeed = params.get("f")
    const selected = !paramsFeed || paramsFeed != "siguiendo" ? "En discusión" : "Siguiendo"
    const router = useRouter()

    const [order, setOrder] = useState(selected == "En discusión" ? "Populares" : "Recientes")

    function onSelection(v: string){
        router.push("/inicio" + (v == "Siguiendo" ? "?f=siguiendo" : "?f=discusion"))
        if(v == "Siguiendo" && order != "Recientes") setOrder("Recientes")
        if(v == "En discusión" && order != "Populares") setOrder("Populares")
    }

    return <div className="w-full mt-10">
        <div className={"fixed top-0 bg-[var(--background)] max-w-[600px] w-full mx-[1px] z-[1000]"}>
            <MainFeedHeader
                selected={selected}
                onSelection={onSelection}
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