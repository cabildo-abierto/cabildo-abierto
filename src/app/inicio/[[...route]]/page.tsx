"use client"
import React from "react"
import { ThreeColumnsLayout } from "@/components/three-columns";
import { WikiCategories } from "@/components/wiki-categories";
import { CategoryArticles } from "@/components/category-articles";
import SelectionComponent from "@/components/search-selection-component";
import { useRouter } from "next/navigation";
import { RouteFeed } from "@/components/route-feed";
import { useSearch } from "@/components/search-context";
import { CategoryUsers } from "@/components/category-users";



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
                options={["General", "Siguiendo", "Artículos colaborativos", "Usuarios"]}
                selected={selected}
                className="main-feed"
            />
        </div>
        
        <div className="mt-1">
        {selected == "Artículos colaborativos" && 
        <CategoryArticles route={decodedRoute}/>}

        {(selected == "General" || selected == "Siguiendo") && 
        <RouteFeed
        route={decodedRoute}
        following={selected == "Siguiendo"}
        />}

        {selected == "Usuarios" && <CategoryUsers route={decodedRoute}/>}
        </div>
    </div>

    return <ThreeColumnsLayout center={center} />
}
export default TopicsPage