"use client"

import { useState } from "react"
import Feed from "./feed"


const MainFeed = ({contents, user}: any) => {
    const [following, setFollowing] = useState(false)
    return <div className="w-full bg-white h-full">
        
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

        <Feed userFollowing={following} user={user} contents={contents}/>
    </div>
}

export default MainFeed