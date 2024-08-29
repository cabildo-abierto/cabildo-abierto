import { SmallEntityProps } from "src/app/lib/definitions"
import { EntitySearchResult } from "./entity-search-result"
import InfoPanel from "./info-panel"
import { entityInRoute } from "./wiki-categories"
import LoadingSpinner from "./loading-spinner"
import { useEntities } from "src/app/hooks/entities"
import { useSearch } from "./search-context"
import { NoResults } from "./category-users"


function popularityScore(entity: SmallEntityProps){
    return entity._count.reactions + entity._count.referencedBy + (entity.versions.length != 0 ? 1 : 0)
}


const ArticlesWithSearch = ({entities}: {entities: SmallEntityProps[]}) => {
    const {searchValue} = useSearch()

    function isMatch(entity: SmallEntityProps){
        return entity.name.toLowerCase().includes(searchValue.toLowerCase())
    }

    let filteredEntities = entities.filter(isMatch)

    function order(a: {score: number}, b: {score: number}){
        return b.score - a.score // score descending
    }

    let entitiesWithScore = filteredEntities.map((entity) => ({entity: entity, score: popularityScore(entity)}))
    entitiesWithScore = entitiesWithScore.sort(order)
    
    return <div className="flex flex-col items-center">
        <div className="flex flex-col justify-center">
            {entitiesWithScore.length > 0 ? entitiesWithScore.map((entity, index) => (
                <div key={index} className="p-1">
                    <EntitySearchResult entity={entity.entity}/>
                </div>
            )) : <NoResults/>}
        </div>
    </div>
}


export const CategoryArticles = ({route}: {route: string[]}) => {
    const entities = useEntities()
    
    if(entities.isLoading){
        return <LoadingSpinner/>
    }
    if(!entities.entities || entities.isError){
        return <></>
    }
    
    const routeEntities = entities.entities.filter((entity) => (entityInRoute(entity, route)))

    return <>
        {false && <div className="flex items-center">
            <h3 className="flex ml-2 py-4 mr-1">Artículos colaborativos</h3>
            <InfoPanel text="Artículos informativos que cualquier usuario puede editar."/>
        </div>}
        {routeEntities.length > 0 ? 
            <ArticlesWithSearch entities={routeEntities}/>
             : 
            <div className="flex justify-center">No hay artículos en esta categoría</div>}
    </>
}