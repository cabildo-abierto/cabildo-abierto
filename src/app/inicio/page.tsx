"use client"
import React, { useState } from "react"
import Feed from "@/components/feed";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { getTrending } from "@/actions/trending";


const TrendingTopic: React.FC<{value: string, count: number}> = ({value, count}) => {
    return <div className="py-2">
        <div className="font-semibold">
            {value}
        </div>
        <div className="text-gray-600">
            {count} menciones
        </div>
    </div>
}


const TrendingTopicsPanel = async () => {
    const trending = await getTrending(5)
    return <div className="flex justify-center w-full py-8 px-2">
        <div className="rounded border px-2 py-2">
            <h3 className="px-4">
                Tendencias
            </h3>
            <ul>
                {trending.map((word, index) => {
                    return <li key={index} className="">
                        <TrendingTopic value={word.word} count={word.count}/>
                    </li>
                })}
            </ul>
        </div>
    </div>
}


const Inicio: React.FC = () => {
    const [following, setFollowing] = useState(false)


    const center = <div className="w-full bg-white h-full">
        
        <div className="flex justify-center items-center space-x-2 py-8">
        <span className={`text-sm ${!following ? 'text-blue-500' : 'text-gray-500'}`}>General</span>
        <button
            onClick={() => {setFollowing(!following)}}
            className={`w-20 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                following ? 'bg-blue-500' : 'bg-gray-300'
            }`}
        >
            <div
            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                following ? 'translate-x-12' : ''
            }`}
            />
        </button>
        <span className={`text-sm ${following ? 'text-blue-500' : 'text-gray-500'}`}>Siguiendo</span>
        </div>



        <Feed onlyFollowing={following}/>
    </div>

    const right = null// <TrendingTopicsPanel/>

    return <ThreeColumnsLayout center={center} right={right}/>
}

export default Inicio
