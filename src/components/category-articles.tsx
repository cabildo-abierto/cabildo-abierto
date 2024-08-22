import { EntityProps } from "@/app/lib/definitions"
import { EntitySearchResult } from "./entity-search-result"
import { useState } from "react"
import InfoPanel from "./info-panel"
import { SearchInput } from "./searchbar"


const ArticlesWithSearch = ({entities}: {entities: EntityProps[]}) => {
    const [searchValue, setSearchValue] = useState("")

    function isMatch(entity: EntityProps){
        return entity.name.toLowerCase().includes(searchValue.toLowerCase())
    }

    return <div className="flex flex-col items-center">
        <div className="my-4 py-2 border rounded border-[var(--accent)] px-2">
            <SearchInput onChange={(v: string) => {setSearchValue(v)}}/>
        </div>
        <div className="flex flex-col justify-center">
            {entities.filter(isMatch).map((entity, index) => (
                <div key={index} className="p-1">
                    <EntitySearchResult entity={entity}/>
                </div>
            ))}
        </div>
    </div>
}


export const CategoryArticles = ({entities}: {entities: EntityProps[]}) => {

    return <div className="mx-2 mt-8">
        {false && <div className="flex items-center">
            <h3 className="flex ml-2 py-4 mr-1">Artículos colaborativos</h3>
            <InfoPanel text="Artículos informativos que cualquier usuario puede editar."/>
        </div>}
        {entities.length > 0 ? 
            <ArticlesWithSearch entities={entities}/>
             : 
            <div className="flex justify-center">No hay artículos en esta categoría</div>}
    </div>
}