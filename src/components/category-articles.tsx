import { EntityProps } from "@/app/lib/definitions"
import { EntitySearchResult } from "./entity-search-result"
import { useState } from "react"
import InfoPanel from "./info-panel"
import { SearchInput } from "./searchbar"
import { entityInRoute } from "./wiki-categories"
import LoadingSpinner from "./loading-spinner"
import { useEntities } from "@/app/hooks/entities"
import { useSearch } from "./search-context"
import { NoResults } from "./category-users"


const ArticlesWithSearch = ({entities}: {entities: EntityProps[]}) => {
    const {searchValue} = useSearch()

    function isMatch(entity: EntityProps){
        return entity.name.toLowerCase().includes(searchValue.toLowerCase())
    }

    const filteredEntities = entities.filter(isMatch)

    return <div className="flex flex-col items-center">
        <div className="flex flex-col justify-center">
            {filteredEntities.length > 0 ? filteredEntities.map((entity, index) => (
                <div key={index} className="p-1">
                    <EntitySearchResult entity={entity}/>
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