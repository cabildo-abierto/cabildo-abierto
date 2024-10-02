import { EntitySearchResult, getEntityChildrenCount } from "./entity-search-result"
import { useSearch } from "./search-context"
import { NoResults } from "./category-users"
import { SmallEntityProps } from "../app/lib/definitions"
import { useRouteEntities } from "../app/hooks/contents"
import LoadingSpinner from "./loading-spinner"
import { cleanText, listOrderDesc } from "./utils"


function popularityScore(entity: SmallEntityProps){
    return [(entity.versions[entity.versions.length-1].numWords > 0 ? 1 : 0), getEntityChildrenCount(entity) + entity.uniqueViewsCount + entity._count.referencedBy + entity._count.reactions]
}


const ArticlesWithSearch = ({entities, route}: {entities: SmallEntityProps[], route: string[]}) => {
    const {searchValue} = useSearch()

    function isMatch(entity: SmallEntityProps){
        return cleanText(entity.name).includes(cleanText(searchValue))
    }

    let filteredEntities = searchValue.length > 0 ? entities.filter(isMatch) : entities

    let entitiesWithScore = filteredEntities.map((entity) => ({entity: entity, score: popularityScore(entity)}))
    entitiesWithScore = entitiesWithScore.sort(listOrderDesc)
    
    return <div className="flex flex-col items-center w-full">
        {entitiesWithScore.length > 0 ? entitiesWithScore.map((entity, index) => (
            <div key={entity.entity.id} className="py-1 w-full flex justify-center">
                <EntitySearchResult route={route} entity={entity.entity}/>
            </div>
        )) : 
        <NoResults text="No se encontró ningún artículo."/>}
    </div>
}


export const CategoryArticles = ({route}: {route: string[]}) => {
    const routeEntities = useRouteEntities(route)
    if(routeEntities.isLoading) return <LoadingSpinner/>
    
    return <>
        {routeEntities.entities.length > 0 ? 
            <ArticlesWithSearch
                entities={routeEntities.entities}
                route={route}
            />
             : 
        <div className="flex justify-center">
            No se encontraron artículos.
        </div>}
    </>
}