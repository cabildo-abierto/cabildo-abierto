"use client"
import React, { useState } from "react"
import { ThreeColumnsLayout } from "@/components/three-columns";
import { entityInRoute, WikiCategories } from "@/components/wiki-categories";
import Feed from "@/components/feed";
import { useFeed, useFollowingFeed } from "@/app/hooks/contents";
import { CategoryArticles } from "@/components/category-articles";
import { useEntities } from "@/app/hooks/entities";
import SelectionComponent from "@/components/search-selection-component";
import { useUser } from "@/app/hooks/user";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/loading-spinner";
import { RouteFeed } from "@/components/route-feed";



const TopicsPage: React.FC<{
    params: {route: string[]}
    searchParams: { [key: string]: string }
}> = ({params, searchParams}) => {
    const decodedRoute = params.route ? params.route.map(decodeURIComponent) : []
    let selected = searchParams.selected ? searchParams.selected : "General"
    
    const router = useRouter()

    function setSelected(value: string) {
        router.push("/inicio/"+decodedRoute.join("/")+"?selected="+value)
    }

    const center = <div className="w-full">
        <div className="border rounded my-1">
            <WikiCategories route={decodedRoute} selected={selected}/>
            <SelectionComponent
                onSelection={setSelected}
                options={["General", "Siguiendo", "Artículos colaborativos"]}
                selected={selected}
                className="main-feed"
            />
        </div>
        
        {selected == "Artículos colaborativos" && <CategoryArticles route={decodedRoute}/>}

        {selected != "Artículos colaborativos" && <RouteFeed route={decodedRoute} following={selected == "Siguiendo"}/>}
    </div>

    return <ThreeColumnsLayout center={center} />
}
export default TopicsPage