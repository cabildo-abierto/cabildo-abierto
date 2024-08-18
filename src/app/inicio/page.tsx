import React from "react"
import { ThreeColumnsLayout } from "@/components/main-layout";
import MainFeed from "@/components/main-feed";


const Inicio: React.FC = () => {
    const center = <MainFeed/>

    const right = null // <TrendingTopicsPanel/>

    return <ThreeColumnsLayout center={center} right={right}/>
}

export default Inicio
