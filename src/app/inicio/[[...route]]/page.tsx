"use client"
import React, {useState} from "react"
import { MainPage } from "../../../components/main-page"


const Page: React.FC<{
    params: {route: string[]}
    searchParams: { [key: string]: string }
}> = ({params, searchParams}) => {
    const decodedRoute = params.route ? params.route.map(decodeURIComponent) : []

    const [route, setRoute] = useState(decodedRoute)

    return <MainPage
        route={route}
        setRoute={setRoute}
    />
}
export default Page