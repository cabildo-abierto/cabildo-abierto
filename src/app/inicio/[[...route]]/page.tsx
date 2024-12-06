"use client"
import React, { useState } from "react"
import { ThreeColumnsLayout } from "../../../components/three-columns"
import { MainPage } from "../../../components/main-page"


const TopicsPage: React.FC<{
    params: {route: string[]}
    searchParams: { [key: string]: string }
}> = ({params, searchParams}) => {
    const decodedRoute = params.route ? params.route.map(decodeURIComponent) : []

    const [route, setRoute] = useState(decodedRoute)

    const center = <MainPage
        route={route}
        setRoute={setRoute}
    />
    
    return <ThreeColumnsLayout center={center} />
}
export default TopicsPage