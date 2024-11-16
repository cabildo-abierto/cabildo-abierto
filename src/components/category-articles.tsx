"use client"
import { EntitySearchResult } from "./entity-search-result"
import { useSearch } from "./search-context"
import { NoResults } from "./category-users"
import { SmallEntityProps } from "../app/lib/definitions"
import { useRouteEntities } from "../app/hooks/contents"
import LoadingSpinner from "./loading-spinner"
import { articleUrl, cleanText, listOrderDesc, route2Text } from "./utils"
import { LazyLoadFeed } from "./lazy-load-feed"
import Link from "next/link"
import { DidYouKnow } from "./did-you-know"
import { useState } from "react"
import SelectionComponent from "./search-selection-component"
import { NewPublicArticleButton } from "./new-public-article-button"
import { topicPopularityScore } from "./trending-articles"
import { TipIcon } from "./icons"


export function countUserReferences(entity: SmallEntityProps){
    let s = new Set(entity.referencedBy.map((r) => (r.authorId)))
    return s.size
}


function recentEditScore(entity: SmallEntityProps){
    return [new Date(entity.versions[entity.versions.length-1].createdAt).getTime()]
}


const ArticlesWithSearch = ({ entities, route, sortBy, maxCount }: { 
    entities: SmallEntityProps[], 
    route: string[],
    sortBy: string,
    maxCount?: number
 }) => {
    const { searchState } = useSearch();

    function isMatch(entity: SmallEntityProps) {
        return cleanText(entity.name).includes(cleanText(searchState.value));
    }

    let filteredEntities = searchState.value.length > 0 ? entities.filter(isMatch) : entities;

    const scoreFunc = sortBy == "Populares" ? topicPopularityScore : recentEditScore

    let entitiesWithScore = filteredEntities.map((entity) => ({ entity: entity, score: scoreFunc(entity) }));

    entitiesWithScore = entitiesWithScore.sort(listOrderDesc)
    
    function generator(index: number){
        const entity = entitiesWithScore[index]?.entity;
        return {
            c: entity ? <EntitySearchResult route={route} entity={entity} /> : null,
            key: entity.id
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
    const {entities: routeEntities, isLoading, isError} = useRouteEntities(route)
    const [sortBy, setSortBy] = useState("Populares")

    if(isLoading) return <LoadingSpinner/>
    if(isError){
        return <></>
    }

    const infoText = <span>Ordenados por cantidad de usuarios que participaron en la discusión del tema (ya sea mencionándolo, comentando o agregando un voto hacia arriba).</span>

    return <>

        {/*!onSearchPage && <div className="mt-2"><DidYouKnow text={<>¿Sabías que si editás el contenido de un tema Cabildo Abierto te remunera por cada persona que entre a leerlo en el futuro? <Link className="link2" href={articleUrl("Cabildo_Abierto%3A_Remuneraciones")}>Leer más.</Link></>}/></div>*/}

        {!onSearchPage && <div className="mt-4">
            <DidYouKnow text={<div className="flex items-center">
                <div className="px-2"><TipIcon/></div> Elegí un tema de la lista para agregarle información o creá un nuevo tema.</div>}/>
        </div>}
        
        {!onSearchPage && <div className="flex justify-center py-4">
            <NewPublicArticleButton
                onClick={() => {}}
            />
        </div>}
        
        {!onSearchPage && <div className="flex flex-1 justify-center text-sm space-x-1 mb-4">
                <div className="rounded content-container">
            <SelectionComponent
                onSelection={setSortBy}
                selected={sortBy}
                options={["Populares", "Ediciones recientes"]}
                optionsNodes={[<div key={0}>Populares</div>, <div key={1}>Ediciones recientes</div>]}
                infoPanelTexts={[infoText, null]}
                className="filter-feed"
                
                showExplanations={false}
            />
                </div>
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
        </div>}

    </>
}