import { useState } from "react"
import { FastAndPostIcon, FastPostIcon, PopularIcon, PostIcon, RecentIcon } from "./icons"
import SelectionComponent from "./search-selection-component"
import { Route } from "./wiki-categories"


type MainFeedHeaderProps = {
    route: string[]
    selected: string
    onSelection: (v: string) => void
    showRoute: boolean
    order: string
    setOrder: (v: string) => void
    filter: string
    setFilter: (v: string) => void    
}


export const MainFeedHeader = ({
    route, selected, onSelection, showRoute, order, setOrder, filter, setFilter
}: MainFeedHeaderProps) => {
    return <div className="pt-1 mt-2">
        <div className="content-container mb-1">
        {showRoute && 
            <div className="flex flex-col">
                <span className="ml-2 text-sm text-[var(--text-light)]">
                    Estás viendo:
                </span>
                <div className="flex pb-2 items-center px-2">
                    <Route route={route} selected={selected}/>
                </div>
            </div>
        }
        <SelectionComponent
            onSelection={onSelection}
            options={["General", "Siguiendo", "Artículos públicos", "Usuarios"]}
            selected={selected}
            className="main-feed"
        />
        </div>

        {(selected == "General" || selected == "Siguiendo") && <div className="flex justify-center text-sm space-x-1">
            <div className="w-1/2 border-r rounded border-t border-b border-l">
            <SelectionComponent
                className="filter-feed"
                onSelection={setFilter}
                selected={filter}
                options={["Todas", "Rápidas", "Elaboradas"]}
                optionsNodes={[<div key={0}><FastAndPostIcon/></div>, <div key={1}><FastPostIcon/></div>, <div key={2}><PostIcon/></div>]}
                optionExpl={["Todas las publicaciones", "Solo publicaciones rápidas", "Solo publicaciones con título"]}
            />
            </div>
            <div className="w-1/2 border-r rounded border-t border-b border-l">
            <SelectionComponent
                className="filter-feed"
                onSelection={setOrder}
                selected={order}
                options={["Recientes", "Populares"]}
                optionsNodes={[<span key={0}><RecentIcon/></span>, <span key={1}><PopularIcon/></span>]}
                optionExpl={["Publicaciones ordenadas por fecha de publicación", "Publicaciones ordenadas por cantidad de reacciones positivas."]}
            />
            </div>
        </div>}
    </div>
}