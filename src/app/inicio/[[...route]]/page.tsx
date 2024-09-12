"use client"
import React, { useEffect } from "react"
import { RouteContent } from "../../../components/route-content"
import { ThreeColumnsLayout } from "../../../components/three-columns"
import { preload } from "swr"
import { fetcher } from "../../hooks/utils"


const TopicsPage: React.FC<{
    params: {route: string[]}
    searchParams: { [key: string]: string }
}> = ({params, searchParams}) => {
    const decodedRoute = params.route ? params.route.map(decodeURIComponent) : []

    useEffect(() => {
        preload("/api/users", fetcher)
        preload("/api/entities", fetcher)
        preload("/api/feed/", fetcher)
        preload("/api/following-feed/", fetcher)
    }, [])

    const center = <RouteContent
        route={decodedRoute}
    />

    return <ThreeColumnsLayout center={center} />
}
export default TopicsPage