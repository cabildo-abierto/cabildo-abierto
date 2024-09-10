"use client"
import React, { useState } from "react"
import { WikiCategories } from "src/components/wiki-categories";
import { CategoryArticles } from "src/components/category-articles";
import SelectionComponent from "src/components/search-selection-component";
import { useRouter } from "next/navigation";
import { RouteFeed } from "src/components/route-feed";
import { CategoryUsers } from "src/components/category-users";
import { SmallContentProps, SmallEntityProps, SmallUserProps } from "src/app/lib/definitions";


type RouteContentProps = {
    route: string[], 
    paramsSelected?: string
    feed: SmallContentProps[]
    followingFeed: SmallContentProps[]
    routeEntities: SmallEntityProps[]
    users: SmallUserProps[]
}


export const RouteContent = ({route, paramsSelected, feed, followingFeed, routeEntities, users}: RouteContentProps) => {
    const router = useRouter()
    const [selected, setSelected] = useState(paramsSelected ? paramsSelected : "General")

    function onSelection(v: string){
        setSelected(v)
        router.push("/inicio/"+route.join("/")+"?selected="+v, {scroll: false})
    }

    return <div className="w-full">
        <div className="content-container py-2 mt-2">
            <WikiCategories route={route} selected={selected} routeEntities={routeEntities}/>
            <SelectionComponent
                onSelection={onSelection}
                options={["General", "Siguiendo", "Artículos públicos", "Usuarios"]}
                selected={selected}
                className="main-feed"
            />
        </div>
        
        <div className="pt-2">
        {selected == "Artículos públicos" && 
        <CategoryArticles route={route} routeEntities={routeEntities}/>}

        {(selected == "General" || selected == "Siguiendo") && 
        <RouteFeed
            feed={selected == "Siguiendo" ? followingFeed : feed}
        />}

        {selected == "Usuarios" && <CategoryUsers route={route} users={users}/>}
        </div>
    </div>
}