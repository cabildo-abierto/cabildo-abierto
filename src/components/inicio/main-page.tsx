"use client"

import {useSearchParams} from "next/navigation";
import React from "react";
import {getFeed} from "@/components/feed/feed/get-feed";
import FeedViewContentFeed from "@/components/feed/feed/feed-view-content-feed";
import {useSession} from "@/queries/useSession";
import {
    EnDiscusionMetric,
    EnDiscusionTime,
    FeedFormatOption,
    FollowingFeedFilterOption,
    Session
} from "@/lib/types";
import Link from "next/link";
import {stringToEnum} from "@/utils/strings";
import {
    defaultEnDiscusionFormat,
    defaultEnDiscusionMetric,
    defaultEnDiscusionTime,
    enDiscusionMetricOptions,
    enDiscusionTimeOptions,
    feedFormatOptions,
    followingFeedFilterOption,
    mainFeedOptionToSearchParam,
    searchParamToMainFeedOption
} from "@/components/config/defaults";


export function useFollowingParams(user: Session): {filter: FollowingFeedFilterOption, format: FeedFormatOption} {
    const params = useSearchParams()

    const defaultFilter = user.algorithmConfig.following?.filter ?? "Todos"
    const defaultFormat = user.algorithmConfig.enDiscusion?.format ?? "Todos"
    const filter = stringToEnum(params.get("filtro"), followingFeedFilterOption, defaultFilter)
    const format = stringToEnum(params.get("formato"), feedFormatOptions, defaultFormat)

    return {
        filter,
        format
    }
}


export function useEnDiscusionParams(user: Session): {time: EnDiscusionTime, metric: EnDiscusionMetric, format: FeedFormatOption} {
    const params = useSearchParams()

    const defaultMetric = user.algorithmConfig.enDiscusion?.metric ?? defaultEnDiscusionMetric
    const defaultTime = user.algorithmConfig.enDiscusion?.time ?? defaultEnDiscusionTime
    const defaultFormat = user.algorithmConfig.enDiscusion?.format ?? defaultEnDiscusionFormat
    const metric = stringToEnum(params.get("m"), enDiscusionMetricOptions, defaultMetric)
    const time = stringToEnum(params.get("p"), enDiscusionTimeOptions, defaultTime)
    const format = stringToEnum(params.get("formato"), ["Todos", "Artículos"], defaultFormat)

    return {
        metric,
        time,
        format
    }
}


const followingFeedNoResultsText = <span className={"link"}>
    No se encontraron contenidos. <Link href={"/buscar?s=Usuarios"}>Buscá usuarios para seguir</Link>.
</span>


export const MainPage = () => {
    const params = useSearchParams()
    const paramsFeed = params.get("f")
    const selected = paramsFeed ? searchParamToMainFeedOption(paramsFeed) : "Siguiendo"
    const {user} = useSession()
    const {metric, time} = useEnDiscusionParams(user)
    const {filter, format} = useFollowingParams(user)

    return <div className="w-full">
        {selected == "Siguiendo" &&
        <FeedViewContentFeed
            getFeed={getFeed({type: "siguiendo", params: {filter, format}})}
            noResultsText={followingFeedNoResultsText}
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