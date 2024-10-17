"use client"
import React, { useEffect, useState } from "react"
import { CategoryArticles } from "./category-articles";
import { CategoryUsers } from "./category-users";
import { useRouteFeed, useRouteFollowingFeed } from "../app/hooks/contents";
import { preload } from "swr";
import { fetcher } from "../app/hooks/utils";
import { MainFeedHeader } from "./main-feed-header";
import { ConfiguredFeed } from "./sorted-and-filtered-feed";
import { useUser } from "../app/hooks/user";
import { CreateAccountLink } from "./create-account-link";
import { WritePanelMainFeed } from "./write-panel-main-feed";
import { useSearch } from "./search-context";
import { articleUrl } from "./utils";
import Link from "next/link";
import { CloseButtonIcon } from "./icons";
import { addView } from "../actions/contents";
import { SearchHeader } from "./search-header";
import { TutorialPopup } from "./tutorial-popup";


type RouteContentProps = {
    route: string[],
    setRoute: (v: string[]) => void
    paramsSelected?: string
    showRoute?: boolean
}


export const SearchContent = ({route, setRoute, paramsSelected, showRoute=true}: RouteContentProps) => {
    const [selected, setSelected] = useState(paramsSelected ? paramsSelected : "Publicaciones")
    const feed = useRouteFeed(route)
    const followingFeed = useRouteFollowingFeed(route)
    const [filter, setFilter] = useState("Todas")
    const user = useUser()
    const {searchValue} = useSearch()
    const [closedIntroPopup, setClosedIntroPopup] = useState(false)

    useEffect(() => {
        preload("/api/users", fetcher)
        preload("/api/entities", fetcher)

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
                <CategoryArticles route={route}/>
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
                    feed={feed}
                    order="Recientes"
                    filter={filter}
                    setFilter={setFilter}
                />
            }

            {selected == "Usuarios" && <CategoryUsers route={route}/>}
        </div>
    </div>
}