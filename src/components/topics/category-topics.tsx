import {useTopics} from "@/queries/getters/useTopics"
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner"
import React from "react"
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";
import dynamic from "next/dynamic";
import {TimePeriod} from "@/queries/getters/useTrendingTopics";
import {TTOption} from "@/lib/types";
import Link from "next/link";

import {smoothScrollTo} from "../../../modules/ui-utils/src/scroll";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index";


const TopicSearchResult = dynamic(() => import("@/components/topics/topic/topic-search-result"))
const StaticFeed = dynamic(() => import("../feed/feed/static-feed"))


function ttOptionToTimePeriod(sortedBy: TTOption): TimePeriod {
    if(sortedBy == "Último mes"){
        return "month"
    } else if(sortedBy == "Última semana"){
        return "week"
    } else if(sortedBy == "Último día"){
        return "day"
    } else if(sortedBy == "Ediciones recientes"){
        return "all"
    } else {
        return "all"
    }
}


const LoadingCategoryTopics = () => {
    return <div className={"py-32"}>
        <LoadingSpinner/>
    </div>
}


export const CategoryTopics = ({sortedBy, categories}: {
    sortedBy: TTOption
    categories: string[]
    onSearchPage?: boolean
}) => {
    const time = ttOptionToTimePeriod(sortedBy)
    const {data: topics, error, isLoading} = useTopics(
        categories,
        sortedBy == "Ediciones recientes" ? "recent" : "popular",
        time
    )

    if (isLoading) return <LoadingCategoryTopics/>
    if (!topics) return <ErrorPage>{error?.message ?? "Ocurrió un error al cargar los temas."}</ErrorPage>

    const endText = topics.length == 50 ? <div className={"text-sm text-[var(--text-light)] link px-4"}>
        Se muestran los primeros {topics.length} resultados. Para ver más temas usá la <Link href={"/temas?view=mapa"}>vista de mapa</Link> o el <Link href={"/temas"} onClick={(e) => {e.preventDefault(); smoothScrollTo(0)}}>buscador</Link>.
    </div> : null

    return <div className="flex flex-col items-center w-full" key={sortedBy + categories.join("-")}>
        <StaticFeed
            initialContents={topics}
            FeedElement={({content: t, index}: {content: ArCabildoabiertoWikiTopicVersion.TopicViewBasic, index?: number}) =>
                <TopicSearchResult topic={t} index={index} time={time}/>
            }
            noResultsText={"No se encontró ningún tema."}
            endText={endText}
            getFeedElementKey={(e: ArCabildoabiertoWikiTopicVersion.TopicViewBasic) => {return `${e.id}:${time}`}}
        />
    </div>
}