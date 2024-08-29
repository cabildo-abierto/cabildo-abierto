"use client"
import React from "react"
import { ThreeColumnsLayout } from "src/components/three-columns";
import { WikiCategories } from "src/components/wiki-categories";
import { CategoryArticles } from "src/components/category-articles";
import SelectionComponent from "src/components/search-selection-component";
import { useRouter } from "next/navigation";
import { RouteFeed } from "src/components/route-feed";
import { CategoryUsers } from "src/components/category-users";



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