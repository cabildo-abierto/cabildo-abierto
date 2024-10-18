"use client"
import React, { useEffect, useState } from "react"
import { CategoryArticles } from "./category-articles";
import { CategoryUsers } from "./category-users";
import { useRouteFeed, useSearchableContents } from "../app/hooks/contents";
import { preload } from "swr";
import { fetcher } from "../app/hooks/utils";
import { ConfiguredFeed } from "./sorted-and-filtered-feed";
import { SearchHeader } from "./search-header";


type RouteContentProps = {
    route: string[],
    setRoute: (v: string[]) => void
    paramsSelected?: string
    showRoute?: boolean
}


export const SearchContent = ({route, setRoute, paramsSelected, showRoute=true}: RouteContentProps) => {
    const [selected, setSelected] = useState(paramsSelected ? paramsSelected : "Publicaciones")
    const contents = useSearchableContents()
    const [filter, setFilter] = useState("Todas")

    useEffect(() => {
        preload("/api/users", fetcher)
        preload("/api/entities", fetcher)
        preload("/api/searchable-contents", fetcher)

        // probablemente estos dos no tenga sentido ponerlos acá
        preload("/api/feed/", fetcher)
        preload("/api/following-feed/", fetcher)
    }, [])

    return <div className="w-full">
        <SearchHeader
            route={route}
            setRoute={setRoute}
            selected={selected}
            onSelection={setSelected}
            showRoute={showRoute}
            filter={filter}
            setFilter={setFilter}
        />
        
        <div className="pt-1">

            {selected == "Temas" && 
                <CategoryArticles route={route} onSearchPage={true}/>
            }

            {/*selected == "General" &&
                <div className="text-center mt-1 mb-2">
                    <span className="text-[var(--text-light)] text-sm">
                        Un muro con lo que está pasando en Cabildo Abierto, sin personalización
                    </span>
                </div>*/
            }

            {selected == "Publicaciones" &&
                <ConfiguredFeed
                    feed={contents}
                    order="Recientes"
                    filter={filter}
                    setFilter={setFilter}
                />
            }

            {selected == "Usuarios" && <CategoryUsers route={route}/>}
        </div>
    </div>
}