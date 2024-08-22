import { Route } from "./wiki-categories"



export const EntityCategories = ({categories}: {categories: string}) => {

    const parsedCategories: string[][] = JSON.parse(categories)

    return <div className="flex flex-col">
        {parsedCategories.length > 0 ? parsedCategories.map((category: string[], index: number) => {
            return <div key={index}>
                <Route route={category}/>
            </div>
        }): 
        <span>Ninguna categoría asignada.</span>
        }
    </div>
}
