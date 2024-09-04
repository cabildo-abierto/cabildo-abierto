import InfoPanel from "./info-panel"
import { Route } from "./wiki-categories"

export const EntityCategoriesTitle = ({name}: {name: string}) => {
    const info = "Cada artículo puede estar en una o más categorías y subcategorías. Al asignar un artículo a una categoría que no existe todavía (borde azul) se crea automáticamente esa categoría."

    return <div className="ml-1 mb-4 flex items-center">
        <h3 className="mr-1">Categorías de {name}</h3>
        <InfoPanel text={info} className="w-96"/>
    </div>
}

export const EntityCategories = ({categories, name}: {categories: string, name: string}) => {

    const parsedCategories: string[][] = JSON.parse(categories)

    return <div className="flex flex-col border-t border-b py-4 my-6">
        <EntityCategoriesTitle name={name}/>
        {parsedCategories.length > 0 ? parsedCategories.map((category: string[], index: number) => {
            return <div key={index}>
                <Route route={category}/>
            </div>
        }): 
        <span>Ninguna categoría asignada.</span>
        }
    </div>
}
