"use client"

import {useSearchParams} from "next/navigation";
import React from "react";
import FeedViewContentFeed from "./feed-view-content-feed";
import {useSession} from "@/components/auth/use-session";
import {stringToEnum} from "@cabildo-abierto/utils";
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
} from "../config/defaults";
import {LoginRequiredPage} from "../../layout/main-layout/page-requires-login-checker";
import {BaseButton} from "@/components/utils/base/base-button";
import Link from "next/link";
import { Note } from "@/components/utils/base/note";
import {CaretDownIcon} from "@phosphor-icons/react";
import {EnDiscusionMetric, EnDiscusionTime, FeedFormatOption, FollowingFeedFilter, Session} from "@cabildo-abierto/api";
import {useGetFeed} from "@/components/feed/feed/get-feed";
import {chronologicalFeedMerger} from "@/components/feed/feed/feed-merger";


export function useFollowingParams(user: Session): {
    filter: FollowingFeedFilter
    format: FeedFormatOption } {
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


export function useEnDiscusionParams(user: Session): {
    time: EnDiscusionTime,
    metric: EnDiscusionMetric,
    format: FeedFormatOption
} {
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


const followingFeedNoResultsText = <div
    className="flex flex-col items-center space-y-8 text-base text-[var(--text-light)]"
>
    <div>
        No se encontraron contenidos.
    </div>
    <Link href={"/buscar?s=Usuarios"}>
        <BaseButton variant="outlined" size={"small"}>
            Buscar usuarios
        </BaseButton>
    </Link>
</div>

const discoverFeedNoResultsText = <div>
    <Note className={""}>
        No se encontraron contenidos.
    </Note>
    <Note>
        Configurá tus intereses tocando la flechita de arriba (<CaretDownIcon
        className={"inline-block"}/>)
    </Note>
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
    const {getFeed} = useGetFeed()

    return <div className="w-full">
        {selected == "Siguiendo" && user &&
            <FeedViewContentFeed
                getFeed={getFeed({type: "siguiendo", params: {filter, format}})}
                noResultsText={followingFeedNoResultsText}
                endText={"Fin del muro."}
                queryKey={["main-feed", mainFeedOptionToSearchParam(selected), filter, format]}
                feedMerger={chronologicalFeedMerger}
            />}

        {selected == "Descubrir" && user &&
            <FeedViewContentFeed
                getFeed={getFeed({type: "descubrir"})}
                noResultsText={discoverFeedNoResultsText}
                endText={"Fin del muro."}
                queryKey={["main-feed", mainFeedOptionToSearchParam(selected)]}
            />}

        {(selected == "Siguiendo" || selected == "Descubrir") && !user &&
            <LoginRequiredPage text={"Iniciá sesión para ver este muro."}/>}

        {selected == "En discusión" &&
            <FeedViewContentFeed
                getFeed={getFeed({type: "discusion", params: {metric, time, format}})}
                noResultsText={"No hay contenidos en discusión."}
                endText={"Fin del muro."}
                queryKey={["main-feed", mainFeedOptionToSearchParam(selected), metric, time, format]}
            />}

    </div>
}