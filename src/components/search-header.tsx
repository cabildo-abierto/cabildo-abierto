import { FastAndPostIcon, FastPostIcon, PopularIcon, PostIcon, RecentIcon } from "./icons"
import InfoPanel from "./info-panel"
import SelectionComponent from "./search-selection-component"
import { Route } from "./wiki-categories"


type SearchHeaderProps = {
    route: string[]
    setRoute: (v: string[]) => void
    selected: string
    onSelection: (v: string) => void
    showRoute: boolean
    filter: string
    setFilter: (v: string) => void    
}


export const SearchHeader = ({
    route, setRoute, selected, onSelection, showRoute, filter, setFilter
}: SearchHeaderProps) => {

    const generalInfo = <>Un muro con lo que está pasando en Cabildo Abierto, sin personalización.</>

    return <div className="mt-2">
        <div className="content-container mb-1">
        {/*showRoute && 
            <div className="flex flex-col pt-1">
                <span className="ml-2 text-sm text-[var(--text-light)]">
                    Estás viendo:
                </span>
                <div className="flex pb-2 items-center px-2">
                    <Route route={route} setRoute={setRoute} selected={selected}/>
                </div>
            </div>
        */}
        <SelectionComponent
            onSelection={onSelection}
            options={["Publicaciones", "Temas", "Usuarios"]}
            selected={selected}
            className="main-feed text-sm sm:text-base"
        />
        </div>
    </div>
}