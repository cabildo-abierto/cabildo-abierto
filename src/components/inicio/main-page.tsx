"use client"

import {useSearchParams} from "next/navigation";
import React from "react";
import {getFeed} from "@/components/feed/feed/get-feed";
import FeedViewContentFeed from "@/components/feed/feed/feed-view-content-feed";
import {useSession} from "@/queries/getters/useSession";
import {EnDiscusionMetric, EnDiscusionTime, FeedFormatOption, FollowingFeedFilterOption, Session} from "@/lib/types";
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
import {LoginRequiredPage} from "@/components/layout/page-requires-login-checker";
import { Button } from "../../../modules/ui-utils/src/button";


export function useFollowingParams(user: Session): {filter: FollowingFeedFilterOption, format: FeedFormatOption} {
    const params = useSearchParams()

    const config = user ? user.algorithmConfig : undefined

    const defaultFilter = config?.following?.filter ?? "Todos"
    const defaultFormat = config?.enDiscusion?.format ?? "Todos"
    const filter = stringToEnum(params.get("filtro"), followingFeedFilterOption, defaultFilter)
    const format = stringToEnum(params.get("formato"), feedFormatOptions, defaultFormat)

    return {
        filter,
        format
    }
}


export function useEnDiscusionParams(user: Session): {time: EnDiscusionTime, metric: EnDiscusionMetric, format: FeedFormatOption} {
    const params = useSearchParams()

    const config = user ? user.algorithmConfig.enDiscusion : undefined

    const defaultMetric = config?.metric ?? defaultEnDiscusionMetric
    const defaultTime = config?.time ?? defaultEnDiscusionTime
    const defaultFormat = config?.format ?? defaultEnDiscusionFormat
    const metric = stringToEnum(params.get("m"), enDiscusionMetricOptions, defaultMetric)
    const time = stringToEnum(params.get("p"), enDiscusionTimeOptions, defaultTime)
    const format = stringToEnum(params.get("formato"), ["Todos", "Artículos"], defaultFormat)

    return {
        metric,
        time,
        format
    }
}


const followingFeedNoResultsText = <div className={"flex flex-col items-center space-y-8 text-base text-[var(--text-light)]"}>
    <div>
        No se encontraron contenidos.
    </div>
    <Button href={"/buscar?s=Usuarios"} size={"small"}>
        Buscar usuarios
    </Button>
</div>


export function useMainPageSelected(user: Session) {
    const params = useSearchParams()
    const paramsFeed = params.get("f")
    return paramsFeed ? searchParamToMainFeedOption(paramsFeed) : (!user ? "En discusión" : "Siguiendo")
}


export const MainPage = () => {
    const {user} = useSession()
    const selected = useMainPageSelected(user)
    const {metric, time} = useEnDiscusionParams(user)
    const {filter, format} = useFollowingParams(user)

    return <div className="w-full">
        {selected == "Siguiendo" && user &&
        <FeedViewContentFeed
            getFeed={getFeed({type: "siguiendo", params: {filter, format}})}
            noResultsText={followingFeedNoResultsText}
            endText={"Fin del feed."}
            queryKey={["main-feed", mainFeedOptionToSearchParam(selected), filter, format]}
        />}
        {selected == "Siguiendo" && !user && <LoginRequiredPage text={"Creá una cuenta o iniciá sesión para ver este muro."}/>}
        {selected == "En discusión" &&
        <FeedViewContentFeed
            getFeed={getFeed({type: "discusion", params: {metric, time, format}})}
            noResultsText={"No hay contenidos en discusión."}
            endText={"Fin del feed."}
            queryKey={["main-feed", mainFeedOptionToSearchParam(selected), metric, time, format]}
        />}
    </div>
}