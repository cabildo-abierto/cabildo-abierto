import { EntitySearchResult } from "./entity-search-result"
import { useSearch } from "./search-context"
import { NoResults } from "./category-users"
import { SmallEntityProps } from "../app/lib/definitions"
import { useRouteEntities } from "../app/hooks/contents"
import LoadingSpinner from "./loading-spinner"
import { articleUrl, cleanText, currentVersion, listOrderDesc, route2Text } from "./utils"
import { LazyLoadFeed } from "./lazy-load-feed"
import Link from "next/link"
import { DidYouKnow } from "./did-you-know"
import { useState } from "react"
import SelectionComponent from "./search-selection-component"
import { NewPublicArticleButton } from "./new-public-article-button"
import { countUserInteractions } from "./trending-articles"


export function countUserReferences(entity: SmallEntityProps){
    let s = new Set(entity.referencedBy.map((r) => (r.authorId)))
    return s.size
}


function popularityScore(entity: SmallEntityProps){
    return [(entity.versions[currentVersion(entity)].numWords > 0 ? 1 : 0), countUserInteractions(entity)]
}


function recentEditScore(entity: SmallEntityProps){
    return [new Date(entity.versions[entity.versions.length-1].createdAt).getTime()]
}


const ArticlesWithSearch = ({ entities, route, sortBy }: { 
    entities: SmallEntityProps[], 
    route: string[],
    sortBy: string
 }) => {
    const { searchValue } = useSearch();

    function isMatch(entity: SmallEntityProps) {
        return cleanText(entity.name).includes(cleanText(searchValue));
    }

    let filteredEntities = searchValue.length > 0 ? entities.filter(isMatch) : entities;

    const scoreFunc = sortBy == "Populares" ? popularityScore : recentEditScore

    let entitiesWithScore = filteredEntities.map((entity) => ({ entity: entity, score: scoreFunc(entity) }));

    entitiesWithScore = entitiesWithScore.sort(listOrderDesc);

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
                <LazyLoadFeed maxSize={entitiesWithScore.length} generator={generator} />
            ) : (
                <NoResults text="No se encontró ningún artículo." />
            )}
        </div>
    );
};



export const CategoryArticles = ({route}: {route: string[]}) => {
    const routeEntities = useRouteEntities(route)
    const {searchValue} = useSearch()
    const [sortBy, setSortBy] = useState("Populares")

    if(routeEntities.isLoading) return <LoadingSpinner/>

    const infoText = <span>Se suma la cantidad de comentarios, la cantidad de usuarios distintos que entraron y la cantidad de votos hacia arriba que recibió. Los artículos vacíos se muestran al final. Solo se muestran artículos de la categoría seleccionada ({route2Text(route)}).</span>

    return <>
        {searchValue.length == 0 && <div className="mt-2"><DidYouKnow text={<><p>¿Sabías que si editás un artículo público Cabildo Abierto <Link className="link2" href={articleUrl("Cabildo_Abierto%3A_Remuneraciones")}>te paga</Link> por cada persona que entre a leerlo en el futuro?</p> <p>Incluso si otras personas lo siguen editando después.</p></>}/></div>}
        
        {searchValue.length == 0 && <div className="flex justify-center py-4">
            <NewPublicArticleButton
                onClick={() => {}}
                className="gray-btn"
                textClassName="title text-sm"
                text="Nuevo artículo público"
                showInfoPanel={false}
            />
        </div>}

        {searchValue.length == 0 && 
            <div className="flex justify-center text-sm space-x-1 mb-4">
                <div className="border-r rounded border-t border-b border-l">
            <SelectionComponent
                onSelection={setSortBy}
                selected={sortBy}
                options={["Populares", "Ediciones recientes"]}
                optionsNodes={[<div key={0}>Populares</div>, <div key={1}>Ediciones recientes</div>]}
                infoPanelTexts={[infoText, null]}
                className="filter-feed w-48"
                showExplanations={false}
            />
                </div>
            </div>
        }

        {routeEntities.entities.length > 0 ? 
            <ArticlesWithSearch
                entities={routeEntities.entities}
                route={route}
                sortBy={sortBy}
            />
             : 
        <div className="flex justify-center">
            No se encontraron artículos.
        </div>}
    </>
}