import { EntityProps } from "@/app/lib/definitions"
import { EntitySearchResult } from "./entity-search-result"
import { useState } from "react"



export const CategoryArticles = ({entities}: {entities: EntityProps[]}) => {
    const [showing, setShowing] = useState(3)

    function onShowMore(){
        setShowing(showing+9)
    }

    return <div className="categories-panel mx-2 my-4">
        <h3 className="flex ml-2 py-4">Artículos colaborativos</h3>
        {entities.length > 0 ? 
    <div className="">
        <div className="flex flex-wrap justify-center">
            {entities.slice(0, showing).map((entity, index) => (
                <div key={index} className="p-1">
                    <EntitySearchResult entity={entity}/>
                </div>
            ))}
        </div>
        
        {showing < entities.length && 
        <div className="flex justify-center"><button className="view-more mb-2" onClick={onShowMore}>Ver más</button></div>
        }
    </div> : 
    <div className="flex justify-center">No hay artículos en esta categoría</div>}
    </div>
}