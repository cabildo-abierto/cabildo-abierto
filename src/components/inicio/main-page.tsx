"use client"

import {MainFeedHeader} from "./main-feed-header"
import {useSearchParams} from "next/navigation";
import {updateSearchParam} from "@/components/topics/topic/topic-page";
import {Feed, getFeed} from "@/components/feed/feed/feed";
import React from "react";
import Link from "next/link";


export function optionToSearchParam(v: string) {
    if (v == "Siguiendo") return "siguiendo"
    if (v == "En discusión") return "discusion"
    if (v == "Descubrir") return "descubrir"
    return "siguiendo"
}


export function searchParamToOption(v: string) {
    if (v == "siguiendo") return "Siguiendo"
    if (v == "discusion") return "En discusión"
    if (v == "descubrir") return "Descubrir"
    return "Siguiendo"
}


export const MainPage = () => {
    const params = useSearchParams()
    const paramsFeed = params.get("f")
    const selected = paramsFeed ? searchParamToOption(paramsFeed) : "Siguiendo"

    function onSelection(v: string) {
        updateSearchParam("f", optionToSearchParam(v))
    }

    return <div className="w-full min-[500px]:mt-10 mt-20">
        <div className={"fixed top-0 bg-[var(--background)] max-w-[600px] w-full mx-[1px] z-[1000]"}>
            <MainFeedHeader
                selected={selected}
                onSelection={onSelection}
            />
        </div>
        {selected == "Siguiendo" &&
        <Feed
            getFeed={getFeed({type: "siguiendo"})}
            noResultsText={"No se encontraron contenidos. Seguí a más usuarios."}
            endText={"Fin del feed."}
        />}
        {selected == "En discusión" &&
        <Feed
            getFeed={getFeed({type: "discusion"})}
            noResultsText={"No hay contenidos en discusión."}
            endText={"Fin del feed."}
        />}
        {selected == "Descubrir" &&
        <Feed
            getFeed={getFeed({type: "descubrir"})}
            noResultsText={"Próximamente acá vas a encontrar contenidos de usuarios que no seguís."}
            endText={"Fin del feed."}
        />
        }
    </div>
}