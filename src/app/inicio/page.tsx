import React from "react"
import { ThreeColumnsLayout } from "@/components/three-columns";
import MainFeed from "@/components/main-feed";
import { Prueba } from "@/components/prueba";


const Inicio: React.FC = () => {
    const center = <>
        <MainFeed/>
    </>

    const right = null // <TrendingTopicsPanel/>

    return <ThreeColumnsLayout center={center} right={right}/>
}

export default Inicio
