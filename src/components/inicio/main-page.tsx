"use client"

import { MainFeedHeader } from "./main-feed-header"
import Feed from "../feed/feed"
import {useFeed} from "../../hooks/swr";
import {useRouter, useSearchParams} from "next/navigation";


function optionToSearchParam(v: string){
    if (v == "Siguiendo") return "siguiendo"
    if (v == "En discusión") return "discusion"
    if (v == "Descubrir") return "descubrir"
    return "siguiendo"
}


function searchParamToOption(v: string){
    if (v == "siguiendo") return "Siguiendo"
    if (v == "discusion") return "En discusión"
    if (v == "descubrir") return "Descubrir"
    return "Siguiendo"
}


export const MainPage = () => {
    const feed = useFeed("EnDiscusion")
    const followingFeed = useFeed("Siguiendo")
    const discoverFeed = useFeed("Descubrir")
    const params = useSearchParams()
    const paramsFeed = params.get("f")
    const selected = paramsFeed ? searchParamToOption(paramsFeed) : "Siguiendo"
    const router = useRouter()

    function onSelection(v: string){
        router.push("/inicio?f=" + optionToSearchParam(v))
    }

    return <div className="w-full min-[500px]:mt-10 mt-20">
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

        {selected == "Descubrir" && <div className={"py-8 text-center text-[var(--text-light)]"}>
            Próximamente acá vas a poder encontrar contenidos de usuarios que no seguís.
        </div>}

        {/*selected == "Descubrir" && <Feed
            feed={discoverFeed}
        />*/}
    </div>
}