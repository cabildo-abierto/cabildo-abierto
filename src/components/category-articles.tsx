"use client"
import { EntitySearchResult } from "./entity-search-result"
import { useSearch } from "./search/search-context"
import { useTopics } from "../hooks/contents"
import LoadingSpinner from "./loading-spinner"
import { LazyLoadFeed } from "./lazy-load-feed"
import React from "react"
import {NoResults} from "./no-results";
import {TopicsSortOrder} from "./topics-page-header";


export const CategoryArticles = ({sortedBy, categories, maxCount}: {sortedBy: TopicsSortOrder, categories: string[], onSearchPage?: boolean, maxCount?: number}) => {
    const {topics, isLoading, isError} = useTopics(categories, sortedBy == "Populares" ? "popular" : "recent")

    if (isLoading) return <LoadingSpinner/>
    if (isError || !topics) {
        return <></>
    }

    function generator(index: number){
        const topic = topics[index];
        return {
            c: topic ? <EntitySearchResult topic={topic} /> : null,
            key: topic.id
        }
    }

    return <div className="flex flex-col items-center w-full">
        {topics.length > 0 ? (
            <LazyLoadFeed
                maxSize={Math.min(topics.length, maxCount != undefined ? maxCount : topics.length)}
                generator={generator}
            />
        ) : (
            <NoResults text="No se encontró ningún tema."/>
        )}
    </div>
}