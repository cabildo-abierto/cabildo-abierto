"use client"
import {TopicSearchResult} from "@/components/topics/topic/topic-search-result"
import {useTopics} from "@/hooks/api"
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner"
import React from "react"
import {TopicsSortOrder} from "./topics-list-view";
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";
import {Feed} from "../feed/feed/feed"


export const CategoryTopics = ({sortedBy, categories}: {
    sortedBy: TopicsSortOrder
    categories: string[]
    onSearchPage?: boolean
}) => {
    const {data: topics, error, isLoading} = useTopics(categories, sortedBy == "Populares" ? "popular" : "recent")

    if (isLoading) return <LoadingSpinner/>
    if (!topics) return <ErrorPage>{error.message}</ErrorPage>

    const nodes = topics.map((topic, i) => {
        return <div key={i}>
            <TopicSearchResult topic={topic}/>
        </div>
    })

    return <div className="flex flex-col items-center w-full" key={sortedBy + categories.join("-")}>
        <Feed
            initialContents={nodes}
            noResultsText={"No se encontró ningún tema."}
        />
    </div>
}