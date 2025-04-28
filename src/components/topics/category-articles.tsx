"use client"
import { TopicSearchResult } from "@/components/topics/topic/topic-search-result"
import { useTopics } from "@/hooks/api"
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner"
import { LazyLoadFeed } from "../feed/feed/lazy-load-feed"
import React from "react"
import {NoResults} from "@/components/buscar/no-results";
import {TopicsSortOrder} from "./topics-list-view";


export const CategoryArticles = ({sortedBy, categories}: {
    sortedBy: TopicsSortOrder
    categories: string[]
    onSearchPage?: boolean
}) => {
    const {data: topics, isLoading, isError} = useTopics(categories, sortedBy == "Populares" ? "popular" : "recent")

    if (isLoading) return <LoadingSpinner/>
    if (isError || !topics) {
        return <></>
    }

    function generator(index: number){
        const topic = topics[index];
        return {
            c: topic ? <TopicSearchResult topic={topic} /> : null,
            key: topic.id
        }
    }

    return <div className="flex flex-col items-center w-full" key={sortedBy+categories.join("-")}>
        {topics.length > 0 ? (
            <LazyLoadFeed
                maxSize={topics.length}
                initialCount={50}
                generator={generator}
            />
        ) : (
            <NoResults text="No se encontró ningún tema."/>
        )}
    </div>
}