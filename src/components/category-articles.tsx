import { EntityProps } from "@/app/lib/definitions"
import { EntitySearchResult } from "./entity-search-result"
import { useState } from "react"
import InfoPanel from "./info-panel"



export const CategoryArticles = ({entities}: {entities: EntityProps[]}) => {

    return <div className="mx-2 mt-8">
        {false && <div className="flex items-center">
            <h3 className="flex ml-2 py-4 mr-1">Artículos colaborativos</h3>
            <InfoPanel text="Artículos informativos que cualquier usuario puede editar."/>
        </div>}
        {entities.length > 0 ? 
    <div className="">
        <div className="flex flex-col justify-center">
            {entities.map((entity, index) => (
                <div key={index} className="p-1">
                    <EntitySearchResult entity={entity}/>
                </div>
            ))}
        </div>
    </div> : 
    <div className="flex justify-center">No hay artículos en esta categoría</div>}
    </div>
}