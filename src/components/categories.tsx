import InfoPanel from "./info-panel"
import { Route } from "./wiki-categories"

export const EntityCategoriesTitle = ({name, editing}: {name: string, editing: boolean}) => {
    let info = null
    if(editing){
        info = "Cada artículo puede estar en una o más categorías y subcategorías. Al asignar un artículo a una categoría que no existe todavía (borde azul) se crea automáticamente esa categoría."
    } else {
        info = "Cada artículo puede estar en una o más categorías y subcategorías. Al navegar en la pestaña de inicio vas a encontrar a los artículos en las categorías a las que pertenecen."    
    }
    
    return <div className="ml-1 mb-4 flex items-center">
        <h3 className="mr-1">Categorías de {name}</h3>
        <InfoPanel text={info} className="w-96"/>
    </div>
}

export const EntityCategories = ({categories, name}: {categories: string, name: string}) => {

    const parsedCategories: string[][] = JSON.parse(categories)

    return <div className="flex flex-col border-t border-b py-4 my-6">
        <EntityCategoriesTitle name={name} editing={false}/>
        {parsedCategories.length > 0 ? parsedCategories.map((category: string[], index: number) => {
            return <div key={index}>
                <Route route={category}/>
            </div>
        }): 
        <span>Ninguna categoría asignada.</span>
        }
    </div>
}
