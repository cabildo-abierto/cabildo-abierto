import React from "react"
import { ThreeColumnsLayout } from "@/components/main-layout";
import { getContentsMap } from "@/components/update-context";
import MainFeed from "@/components/main-feed";
import { getUser } from "@/actions/get-user";


const Inicio: React.FC = async () => {
    const contents = await getContentsMap()
    const user = await getUser()

    const center = <MainFeed user={user} contents={contents}/>

    const right = null // <TrendingTopicsPanel/>

    return <ThreeColumnsLayout center={center} right={right}/>
}

export default Inicio
