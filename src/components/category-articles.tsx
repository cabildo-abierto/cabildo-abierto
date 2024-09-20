import { EntitySearchResult, getEntityChildrenCount } from "./entity-search-result"
import InfoPanel from "./info-panel"
import { useSearch } from "./search-context"
import { NoResults } from "./category-users"
import { SmallEntityProps } from "../app/lib/definitions"
import { useRouteEntities } from "../app/hooks/contents"
import LoadingSpinner from "./loading-spinner"
import { listOrder, listOrderDesc } from "./utils"


function popularityScore(entity: SmallEntityProps){
    return [(entity.versions.length > 1 ? 1: 0), getEntityChildrenCount(entity) + entity.uniqueViewsCount + entity._count.referencedBy + entity._count.reactions]
}


const ArticlesWithSearch = ({entities}: {entities: SmallEntityProps[]}) => {
    const {searchValue} = useSearch()

    function isMatch(entity: SmallEntityProps){
        return entity.name.toLowerCase().includes(searchValue.toLowerCase())
    }

    let filteredEntities = entities.filter(isMatch)

    let entitiesWithScore = filteredEntities.map((entity) => ({entity: entity, score: popularityScore(entity)}))
    entitiesWithScore = entitiesWithScore.sort(listOrderDesc)
    
    return <div className="flex flex-col items-center">
        <div className="flex flex-col justify-center">
            {entitiesWithScore.length > 0 ? entitiesWithScore.map((entity, index) => (
                <div key={index} className="py-1">
                    <EntitySearchResult entity={entity.entity}/>
                </div>
            )) : <NoResults text="No se encontró ningún artículo."/>}
        </div>
    </div>
}


export const CategoryArticles = ({route}: {route: string[]}) => {
    const routeEntities = useRouteEntities(route)
    if(routeEntities.isLoading) return <LoadingSpinner/>
    
    return <>
        {false && <div className="flex items-center">
            <h3 className="flex ml-2 py-4 mr-1">Artículos públicos</h3>
            <InfoPanel text="Artículos informativos que cualquier usuario puede editar."/>
        </div>}
        {routeEntities.entities.length > 0 ? 
            <ArticlesWithSearch entities={routeEntities.entities}/>
             : 
            <div className="flex justify-center">No hay artículos en esta categoría</div>}
    </>
}