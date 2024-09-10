import React from "react"
import { ThreeColumnsLayout } from "src/components/three-columns";
import { RouteContent } from "src/components/route-content";
import { getRouteEntities, getRouteFeed, getRouteFollowingFeed, getUserId, getUsers } from "src/actions/actions";



const TopicsPage: React.FC<{
    params: {route: string[]}
    searchParams: { [key: string]: string }
}> = async ({params, searchParams}) => {
    const decodedRoute = params.route ? params.route.map(decodeURIComponent) : []

    const userId = await getUserId()
    const feed = await getRouteFeed(decodedRoute)
    const followingFeed = await getRouteFollowingFeed(decodedRoute, userId)
    const routeEntities = await getRouteEntities(decodedRoute)
    const users = await getUsers()

    const center = <RouteContent
        route={decodedRoute}
        feed={feed}
        followingFeed={followingFeed}
        routeEntities={routeEntities}
        users={users}
    />

    return <ThreeColumnsLayout center={center} />
}
export default TopicsPage