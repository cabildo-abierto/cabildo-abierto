import React from "react"
import {getPosts} from "@/actions/get-content";
import Feed from "@/components/feed";
import { ThreeColumnsLayout } from "@/components/main-layout";


const Inicio: React.FC = async () => {
    const feed = await getPosts()

    const center = <div className="w-full bg-white h-full">
        <h2 className="ml-2 py-8">
            En discusión
        </h2>
        <Feed contents={feed}/>
    </div>

    const right = <div className="flex justify-center items-center w-full h-64">
        <div className="rounded-2xl border px-2 py-2">
            <h3>
                Tendencias
            </h3>
            <ul>
                <li>Tendencia 1</li>
                <li>Tendencia 2</li>
                <li>Tendencia 3</li>
            </ul>
        </div>
    </div>

    return <ThreeColumnsLayout center={center} right={right}/>
}

export default Inicio