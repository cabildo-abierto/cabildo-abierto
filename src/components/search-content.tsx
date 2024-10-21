"use client"
import React, { useEffect, useState } from "react"
import { CategoryArticles } from "./category-articles";
import { CategoryUsers } from "./category-users";
import { useRouteFeed, useSearchableContents } from "../app/hooks/contents";
import { preload } from "swr";
import { fetcher } from "../app/hooks/utils";
import { ConfiguredFeed } from "./sorted-and-filtered-feed";
import { SearchHeader } from "./search-header";
import { useSearch } from "./search-context";
import { smoothScrollTo } from "./editor/plugins/TableOfContentsPlugin";


type RouteContentProps = {
    route: string[],
    setRoute: (v: string[]) => void
    paramsSelected?: string
    showRoute?: boolean
}


export const SearchContent = ({route, setRoute, paramsSelected, showRoute=true}: RouteContentProps) => {
    const [selected, setSelected] = useState(paramsSelected ? paramsSelected : "Ninguno")
    const contents = useSearchableContents()
    const [filter, setFilter] = useState("Todas")
    const {searchValue} = useSearch()


    useEffect(() => {
        preload("/api/users", fetcher)
        preload("/api/entities", fetcher)
        preload("/api/searchable-contents", fetcher)

        // probablemente estos dos no tenga sentido ponerlos acá
        preload("/api/feed/", fetcher)
        preload("/api/following-feed/", fetcher)

        if(window.scrollY > 0){
            smoothScrollTo(0)
        }
    }, [])

    const buttonClassName = "sm:text-xl text-base my-4 text-gray-900 rounded-lg bg-[var(--secondary-light)] px-4 py-2 hover:border-[var(--accent)] border border-[var(--secondary-light)]"

    return <div className="w-full h-screen overflow-y-scroll px-2">
        
        <div className="pt-1">

            <div className="mt-7">

            <div className="flex justify-center mb-4 space-x-2 text-sm sm:text-base">
                {<button
                    onClick={() => {setSelected("Publicaciones")}}
                    className={"rounded-lg px-2 border hover:bg-[var(--secondary-light)] " + (selected == "Publicaciones" ? "bg-[var(--secondary-light)]" : "")}>
                        Publicaciones y comentarios
                </button>}
                {<button
                    onClick={() => {setSelected("Temas")}}
                    className={"rounded-lg px-2 border hover:bg-[var(--secondary-light)] " + (selected == "Temas" ? "bg-[var(--secondary-light)]" : "")}>Temas
                </button>}
                {<button
                    onClick={() => {setSelected("Usuarios")}}
                    className={"rounded-lg px-2 border hover:bg-[var(--secondary-light)] " + (selected == "Usuarios" ? "bg-[var(--secondary-light)]" : "")}>Usuarios
                </button>}

            </div>

            {selected == "Temas" && 
                <CategoryArticles route={route} onSearchPage={true}/>
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

            {selected == "Ninguno" && 
                <div className="flex flex-col items-center w-full mb-12">
                    <div className="w-full pb-4 flex flex-col items-center" >
                        <button 
                            className={buttonClassName}
                            onClick={() => {setSelected("Usuarios")}}
                        >
                            Usuarios
                        </button>
                        <CategoryUsers route={route} maxCount={3}/>
                    </div>
                    <div className="px-4 w-full">
                        <hr className="border-1 border-[var(--accent)] w-full"/>
                    </div>
                    <div className="w-full pb-4 flex flex-col items-center">
                        <button 
                            className={buttonClassName}
                            onClick={() => {setSelected("Temas")}}
                        >
                            Temas
                        </button>
                        <CategoryArticles route={route} onSearchPage={true} maxCount={3}/>
                    </div>
                    <div className="px-4 w-full">
                        <hr className="border-1 border-[var(--accent)] w-full"/>
                    </div>
                    <div className="w-full pb-4  flex flex-col items-center">
                        <button 
                            className={buttonClassName}
                            onClick={() => {setSelected("Publicaciones")}}
                        >
                            Publicaciones y comentarios
                        </button>
                        <ConfiguredFeed
                            feed={contents}
                            order="Recientes"
                            filter={filter}
                            setFilter={setFilter}
                            maxCount={3}
                            noResultsText="No se encontró ninguna publicación o comentario"
                        />
                    </div>
                </div>
            
            }

        </div>
    </div>
}