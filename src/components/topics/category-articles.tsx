"use client"
import { TopicSearchResult } from "../topic/topic-search-result"
import { useTopics } from "../../hooks/contents"
import LoadingSpinner from "../ui-utils/loading-spinner"
import { LazyLoadFeed } from "../feed/lazy-load-feed"
import React from "react"
import {NoResults} from "../search/no-results";
import {TopicsSortOrder} from "./topics-list-view";


export const CategoryArticles = ({sortedBy, categories, maxCount}: {sortedBy: TopicsSortOrder, categories: string[], onSearchPage?: boolean, maxCount?: number}) => {
    const {topics, isLoading, isError} = useTopics(categories, sortedBy == "Populares" ? "popular" : "recent")

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