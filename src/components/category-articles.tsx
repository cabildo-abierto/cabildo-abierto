"use client"
import { EntitySearchResult } from "./entity-search-result"
import { useSearch } from "./search/search-context"
import {useTrendingTopics} from "../hooks/contents"
import LoadingSpinner from "./loading-spinner"
import { cleanText, listOrderDesc } from "./utils"
import { LazyLoadFeed } from "./lazy-load-feed"
import React, { useState } from "react"
import SelectionComponent from "./search-selection-component"
import { Button } from "@mui/material"
import {getTopicTitle} from "./topic/utils";
import {NoResults} from "./no-results";
import {CreateTopicModal} from "./create-topic-modal";
import {TrendingTopicProps} from "../app/lib/definitions";
import AddIcon from "@mui/icons-material/Add";


export function countUserReferences(entity: {referencedBy: {referencingContent: {author: {did: string}}}[]}){
    let s = new Set(entity.referencedBy.map((r) => (r.referencingContent.author.did)))
    return s.size
}


function recentEditScore(entity: any){
    return [new Date(entity.versions[entity.versions.length-1].content.record.createdAt).getTime()]
}


const ArticlesWithSearch = ({ entities, route, sortBy, maxCount }: { 
    entities: TrendingTopicProps[],
    route: string[],
    sortBy: string,
    maxCount?: number
 }) => {
    const { searchState } = useSearch();

    function isMatch(topic: any) {
        return cleanText(getTopicTitle(topic)).includes(cleanText(searchState.value));
    }

    let filteredEntities = searchState.value.length > 0 ? entities.filter(isMatch) : entities;

    const scoreFunc = sortBy == "Populares" ? (t: TrendingTopicProps) => (t.score) : recentEditScore

    let entitiesWithScore = filteredEntities.map((entity) => ({ entity: entity, score: scoreFunc(entity) }));

    entitiesWithScore = entitiesWithScore.sort(listOrderDesc)
    
    function generator(index: number){
        const topic = entitiesWithScore[index]?.entity;
        return {
            c: topic ? <EntitySearchResult route={route} topic={topic} /> : null,
            key: topic.id
        }
    }

    return (
        <div className="flex flex-col items-center w-full">
            {entitiesWithScore.length > 0 ? (
                <LazyLoadFeed
                maxSize={Math.min(entitiesWithScore.length, maxCount != undefined ? maxCount : entitiesWithScore.length)}
                generator={generator}/>
            ) : (
                <NoResults text="No se encontró ningún tema." />
            )}
        </div>
    );
};


export const CategoryArticles = ({route, onSearchPage=false, maxCount}: {route: string[], onSearchPage?: boolean, maxCount?: number}) => {
    const {topics: routeEntities, isLoading, isError} = useTrendingTopics(route, "7days")
    const [sortBy, setSortBy] = useState("Populares")
    const [newTopicOpen, setNewTopicOpen] = useState(false)
    const {searchState} = useSearch()

    if(isLoading) return <LoadingSpinner/>
    if(isError){
        return <></>
    }

    if(onSearchPage && searchState.value.length == 0){
        return null
    }

    function optionsNodes(o: string, isSelected: boolean){
        return <div className="text-[var(--text)] w-40">
            <Button
                onClick={() => {}}
                variant="text"
                color="inherit"
                fullWidth={true}
                disableElevation={true}
                sx={{
                    textTransform: "none",
                    paddingY: 0
                }}
            >
                <div className={"pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--primary)] font-semibold border-b-[4px]" : "border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    return <>
        {!onSearchPage && <div className="flex justify-between border-b pr-2 items-center">
            <SelectionComponent
                onSelection={setSortBy}
                options={["Populares", "Ediciones recientes"]}
                selected={sortBy}
                optionsNodes={optionsNodes}
                className="flex justify-between"
            />
            <Button
                color="primary"
                variant="text"
                disableElevation={true}
                startIcon={<AddIcon/>}
                size={"small"}
                sx={{textTransform: "none", height: "32px"}}
                onClick={() => {setNewTopicOpen(true)}}
            >
                Nuevo tema
            </Button>
        </div>
        }


            {routeEntities.length > 0 ?
                <ArticlesWithSearch
                    entities={routeEntities}
                    route={route}
                    sortBy={sortBy}
                    maxCount={maxCount}
                />
                :
                <div className="flex justify-center">
            No se encontraron temas.
        </div>

        }

        <CreateTopicModal open={newTopicOpen} onClose={() => setNewTopicOpen(false)} />
    </>
}