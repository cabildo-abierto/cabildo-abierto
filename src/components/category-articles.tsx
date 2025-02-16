"use client"
import { EntitySearchResult } from "./entity-search-result"
import { useSearch } from "./search/search-context"
import { useTopics } from "../hooks/contents"
import LoadingSpinner from "./loading-spinner"
import { cleanText } from "./utils"
import { LazyLoadFeed } from "./lazy-load-feed"
import React from "react"
import {getTopicTitle} from "./topic/utils";
import {NoResults} from "./no-results";
import {TopicsSortOrder} from "./topics-page-header";


export const CategoryArticles = ({sortedBy, categories, onSearchPage=false, maxCount}: {sortedBy: TopicsSortOrder, categories: string[], onSearchPage?: boolean, maxCount?: number}) => {
    const {topics, isLoading, isError} = useTopics(categories, sortedBy == "Populares" ? "popular" : "recent")
    const {searchState} = useSearch()

    if(isLoading) return <LoadingSpinner/>
    if(isError || !topics){
        return <></>
    }

    if(onSearchPage && searchState.value.length == 0){
        return null
    }


    function isMatch(topic: {id: string, versions: {title?: string}[]}) {
        return cleanText(getTopicTitle(topic)).includes(cleanText(searchState.value));
    }

    let filteredEntities = onSearchPage && searchState.value.length > 0 ? topics.filter(isMatch) : topics;

    function generator(index: number){
        const topic = filteredEntities[index];
        return {
            c: topic ? <EntitySearchResult topic={topic} /> : null,
            key: topic.id
        }
    }

    return <div className="flex flex-col items-center w-full">
        {filteredEntities.length > 0 ? (
            <LazyLoadFeed
                maxSize={Math.min(filteredEntities.length, maxCount != undefined ? maxCount : filteredEntities.length)}
                generator={generator}
            />
        ) : (
            <NoResults text="No se encontró ningún tema."/>
        )}
    </div>
}