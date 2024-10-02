"use client"
import React, { useState } from "react"
import { RouteContent } from "../../../components/route-content"
import { ThreeColumnsLayout } from "../../../components/three-columns"


const TopicsPage: React.FC<{
    params: {route: string[]}
    searchParams: { [key: string]: string }
}> = ({params, searchParams}) => {
    const decodedRoute = params.route ? params.route.map(decodeURIComponent) : []

    const [route, setRoute] = useState(decodedRoute)

    const center = <RouteContent
        route={route}
        setRoute={setRoute}
    />

    return <ThreeColumnsLayout center={center} />
}
export default TopicsPage