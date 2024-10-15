import { FastAndPostIcon, FastPostIcon, PopularIcon, PostIcon, RecentIcon } from "./icons"
import InfoPanel from "./info-panel"
import SelectionComponent from "./search-selection-component"
import { Route } from "./wiki-categories"


type MainFeedHeaderProps = {
    route: string[]
    setRoute: (v: string[]) => void
    selected: string
    onSelection: (v: string) => void
    showRoute: boolean
    order: string
    setOrder: (v: string) => void
    filter: string
    setFilter: (v: string) => void    
}


export const MainFeedHeader = ({
    route, setRoute, selected, onSelection, showRoute, order, setOrder, filter, setFilter
}: MainFeedHeaderProps) => {

    const generalInfo = <>Un muro con lo que está pasando en Cabildo Abierto, sin personalización.</>

    return <div className="mt-2">
        <div className="content-container pt-1 mb-1">
        {showRoute && 
            <div className="flex flex-col">
                <span className="ml-2 text-sm text-[var(--text-light)]">
                    Estás viendo:
                </span>
                <div className="flex pb-2 items-center px-2">
                    <Route route={route} setRoute={setRoute} selected={selected}/>
                </div>
            </div>
        }
        <SelectionComponent
            onSelection={onSelection}
            options={["General", "Siguiendo", "Artículos públicos", "Usuarios"]}
            selected={selected}
            className="main-feed text-sm sm:text-base"
        />
        </div>

        {(selected == "General" || selected == "Siguiendo") && <div className="flex justify-center text-sm space-x-1">
            <div className="w-1/2 border-r rounded border-t border-b border-l">
            <SelectionComponent
                className="filter-feed"
                onSelection={setFilter}
                selected={filter}
                options={["Todas", "Rápidas", "Publicaciones"]}
                optionsNodes={[
                <div className="text-gray-900" key={0}><FastAndPostIcon/></div>,
                <div className="text-gray-900" key={1}><FastPostIcon/></div>,
                <div className="text-gray-900" key={2}><PostIcon/></div>]}
                optionExpl={["Todas las publicaciones", "Solo publicaciones rápidas", "Solo publicaciones con título"]}
            />
            </div>
            <div className="w-1/2 border-r rounded border-t border-b border-l">
            <SelectionComponent
                className="filter-feed"
                onSelection={setOrder}
                selected={order}
                options={["Recientes", "Populares"]}
                optionsNodes={[
                <span className="text-gray-900" key={0}><RecentIcon/></span>, <span className="text-gray-900" key={1}><PopularIcon/></span>]}
                optionExpl={["Publicaciones ordenadas por fecha de publicación", "Se suman la cantidad de votos hacia arriba y la cantidad de comentarios hechos por personas distintas y se los divide por la cantidad de vistas."]}
            />
            </div>
        </div>}
    </div>
}