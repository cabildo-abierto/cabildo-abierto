"use client"

import {MainFeedHeader, MainFeedOption} from "./main-feed-header"
import {useSearchParams} from "next/navigation";
import React from "react";
import {getFeed} from "@/components/feed/feed/get-feed";
import FeedViewContentFeed from "@/components/feed/feed/feed-view-content-feed";
import {updateSearchParam} from "@/utils/fetch";


export function mainFeedOptionToSearchParam(v: MainFeedOption) {
    if (v == "Siguiendo") return "siguiendo"
    if (v == "En discusión") return "discusion"
    if (v == "Descubrir") return "descubrir"
    if (v == "Artículos") return "articulos"
    return "siguiendo"
}


export function searchParamToMainFeedOption(v: string): MainFeedOption {
    if (v == "siguiendo") return "Siguiendo"
    if (v == "discusion") return "En discusión"
    if (v == "descubrir") return "Descubrir"
    if (v == "articulos") return "Artículos"
    return "Siguiendo"
}


export type FollowingFeedFilterOption = "Todos" | "Solo Cabildo Abierto"
export type FeedFormatOption = "Todos" | "Artículos"
export type EnDiscusionMetric = "Me gustas" | "Interacciones" | "Popularidad relativa" | "Recientes"
export type EnDiscusionTime = "Último día" | "Última semana" | "Último mes"
const enDiscusionMetricOptions: EnDiscusionMetric[] = ["Me gustas", "Interacciones", "Popularidad relativa", "Recientes"]
const enDiscusionTimeOptions: EnDiscusionTime[] = ["Último día", "Último mes", "Última semana"]
const feedFormatOptions: FeedFormatOption[] = ["Todos", "Artículos"]
const followingFeedFilterOption: FollowingFeedFilterOption[] = ["Todos", "Solo Cabildo Abierto"]

export function useFollowingParams(): {filter: FollowingFeedFilterOption, format: FeedFormatOption} {
    const params = useSearchParams()

    const filter = stringToEnum(params.get("filtro"), followingFeedFilterOption, "Todos")
    const format = stringToEnum(params.get("formato"), feedFormatOptions, "Todos")

    return {filter, format}
}


function stringToEnum<T>(s: string | undefined, options: string[], defaultValue: T): T {
    if(!s || !options.includes(s)){
        return defaultValue
    } else {
        return s as T
    }
}


export function useEnDiscusionParams(): {time: EnDiscusionTime, metric: EnDiscusionMetric, format: FeedFormatOption} {
    const params = useSearchParams()

    const metric = stringToEnum(params.get("m"), enDiscusionMetricOptions,"Popularidad relativa")
    const time = stringToEnum(params.get("p"), enDiscusionTimeOptions, "Última semana")
    const format = params.get("formato") == "Artículos" ? "Artículos" : "Todos"

    return {metric, time, format}
}


export const MainPage = () => {
    const params = useSearchParams()
    const paramsFeed = params.get("f")
    const selected = paramsFeed ? searchParamToMainFeedOption(paramsFeed) : "Siguiendo"
    const {metric, time} = useEnDiscusionParams()
    const {filter, format} = useFollowingParams()

    function onSelection(v: MainFeedOption) {
        updateSearchParam("f", mainFeedOptionToSearchParam(v))
    }

    return <div className="w-full min-[500px]:mt-10 mt-[88px]">
        <div className={"fixed top-0 bg-[var(--background)] max-w-[600px] w-full mx-[1px] z-[1000]"}>
            <MainFeedHeader
                selected={selected}
                onSelection={onSelection}
            />
        </div>
        {selected == "Siguiendo" &&
        <FeedViewContentFeed
            getFeed={getFeed({type: "siguiendo", params: {filter, format}})}
            noResultsText={"No se encontraron contenidos. Buscá usuarios para seguir."}
            endText={"Fin del feed."}
            queryKey={["main-feed", mainFeedOptionToSearchParam(selected), filter, format]}
        />}
        {selected == "En discusión" &&
        <FeedViewContentFeed
            getFeed={getFeed({type: "discusion", params: {metric, time, format}})}
            noResultsText={"No hay contenidos en discusión."}
            endText={"Fin del feed."}
            queryKey={["main-feed", mainFeedOptionToSearchParam(selected), metric, time, format]}
        />}
    </div>
}