"use client"

import { MainFeedHeader } from "./main-feed-header"
import Feed from "../feed/feed/feed"
import {useFeed} from "@/hooks/swr";
import {useRouter, useSearchParams} from "next/navigation";
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";


export function optionToSearchParam(v: string){
    if (v == "Siguiendo") return "siguiendo"
    if (v == "En discusión") return "discusion"
    if (v == "Descubrir") return "descubrir"
    return "siguiendo"
}


export function searchParamToOption(v: string){
    if (v == "siguiendo") return "Siguiendo"
    if (v == "discusion") return "En discusión"
    if (v == "descubrir") return "Descubrir"
    return "Siguiendo"
}


const SelectedFeed = ({selected}: {selected: string}) => {
    const feed = useFeed(optionToSearchParam(selected))

    if(feed.isLoading){
        return <div className={"py-8"}><LoadingSpinner/></div>
    } else if(feed.error || !feed){
        return <ErrorPage>{feed.error.name}</ErrorPage>
    }

    return <Feed feed={feed.data}/>
}


export const MainPage = () => {
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

        {selected == "Siguiendo" && <SelectedFeed selected={selected}/>}
        {selected == "En discusión" && <SelectedFeed selected={selected}/>}
        {selected == "Descubrir" && <div className={"py-8 text-center text-[var(--text-light)]"}>
            Próximamente acá vas a poder encontrar contenidos de usuarios que no seguís.
        </div>}

        {/*selected == "Descubrir" && <Feed
            feed={discoverFeed}
        />*/}
    </div>
}