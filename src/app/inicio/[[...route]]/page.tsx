"use client"
import React, { useState } from "react"
import { ThreeColumnsLayout } from "src/components/three-columns";
import { WikiCategories } from "src/components/wiki-categories";
import { CategoryArticles } from "src/components/category-articles";
import SelectionComponent from "src/components/search-selection-component";
import { useRouter } from "next/navigation";
import { RouteFeed } from "src/components/route-feed";
import { CategoryUsers } from "src/components/category-users";
import { useUsers } from "src/app/hooks/user";
import { useRouteFeed, useRouteFollowingFeed, useRouteEntities } from "src/app/hooks/contents";
import { RouteContent } from "src/components/route-content";



const TopicsPage: React.FC<{
    params: {route: string[]}
    searchParams: { [key: string]: string }
}> = ({params, searchParams}) => {
    const decodedRoute = params.route ? params.route.map(decodeURIComponent) : []
    const [selected, setSelected] = useState(searchParams.selected ? searchParams.selected : "General")

    const preloadEntities = useRouteEntities(decodedRoute)
    const preloadUsers = useUsers()
    const preloadFeed = useRouteFeed(decodedRoute)
    const preloadFollowingFeed = useRouteFollowingFeed(decodedRoute)
    const router = useRouter()

    const center = <RouteContent route={decodedRoute}/>

    return <ThreeColumnsLayout center={center} />
}
export default TopicsPage