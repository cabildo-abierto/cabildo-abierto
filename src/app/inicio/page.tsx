import React from "react"
import {getPosts} from "@/actions/get-content";
import Feed from "@/components/feed";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { getUserId } from "@/actions/get-user";
import { getTrending } from "@/actions/trending";


const TrendingTopic = ({value, count}) => {
    return <div className="py-2">
        <div className="font-semibold">
            {value}
        </div>
        <div className="text-gray-600">
            {count} menciones
        </div>
    </div>
}


const Inicio: React.FC = async () => {
    const feed = await getPosts(await getUserId())

    const center = <div className="w-full bg-white h-full">
        <h2 className="ml-2 py-8">
            En discusión
        </h2>
        <Feed contents={feed}/>
    </div>

    const trending = await getTrending(5)
    const right = <div className="flex justify-center w-full py-8 px-2">

        <div className="rounded border px-2 py-2">
            <h3 className="px-4">
                Tendencias
            </h3>
            <ul>
                {trending.map((word, index) => {
                    return <li key={index} className="">
                        <TrendingTopic value={word[0]} count={word[1]}/>
                    </li>
                })}
            </ul>
        </div>
    </div>

    return <ThreeColumnsLayout center={center} right={right}/>
}

export default Inicio
