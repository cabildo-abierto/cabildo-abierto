import {useTopics} from "@/queries/useTopics"
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner"
import React from "react"
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";
import dynamic from "next/dynamic";
import {TopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {TimePeriod} from "@/queries/useTrendingTopics";
import {TTOption} from "@/lib/types";


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

    if (isLoading) return <LoadingSpinner/>
    if (!topics) return <ErrorPage>{error?.message ?? "Ocurrió un error al cargar los temas."}</ErrorPage>

    const queryKey = ["category-topics", categories.sort().join(":"), sortedBy]

    return <div className="flex flex-col items-center w-full" key={sortedBy + categories.join("-")}>
        <StaticFeed
            queryKey={queryKey}
            initialContents={topics}
            FeedElement={({content: t, index}: {content: TopicViewBasic, index?: number}) =>
                <TopicSearchResult topic={t} index={index} time={time}/>
            }
            noResultsText={"No se encontró ningún tema."}
            endText={""}
            getFeedElementKey={(e: TopicViewBasic) => {return `${e.id}:${time}`}}
        />
    </div>
}