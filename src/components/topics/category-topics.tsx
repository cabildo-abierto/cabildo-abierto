import {useTopics} from "@/hooks/api"
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner"
import React from "react"
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";
import dynamic from "next/dynamic";
import {TopicsSortOrder} from "@/components/topics/topic-sort-selector";
import {TopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";


const TopicSearchResult = dynamic(() => import("@/components/topics/topic/topic-search-result"))
const StaticFeed = dynamic(() => import("../feed/feed/static-feed"))


export const CategoryTopics = ({sortedBy, categories}: {
    sortedBy: TopicsSortOrder
    categories: string[]
    onSearchPage?: boolean
}) => {
    const {data: topics, error, isLoading} = useTopics(categories, sortedBy == "Populares" ? "popular" : "recent")

    if (isLoading) return <LoadingSpinner/>
    if (!topics) return <ErrorPage>{error.message}</ErrorPage>

    return <div className="flex flex-col items-center w-full" key={sortedBy + categories.join("-")}>
        <StaticFeed
            queryKey={["category-topics", ...categories.sort().join(":"), sortedBy]}
            initialContents={topics}
            FeedElement={({content: t}: {content: TopicViewBasic}) =>
                <TopicSearchResult topic={t}/>
            }
            noResultsText={"No se encontró ningún tema."}
            endText={""}
        />
    </div>
}