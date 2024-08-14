"use client"

import { useState } from "react"
import Feed from "./feed"


const MainFeed = ({contents, user}: any) => {
    const [following, setFollowing] = useState(false);
    return (
        <div className="w-full h-full">
            <div className="flex justify-center items-center space-x-2 py-4">
                <button 
                    disabled={!following}
                    className="gray-btn"
                    onClick={() => {setFollowing(false)}}
                >
                    General
                </button>
                <button 
                    disabled={following}
                    className="gray-btn"
                    onClick={() => {setFollowing(true)}}
                >
                    Siguiendo
                </button>
            </div>
            <Feed following={following} user={user} contents={contents} />
        </div>
    );
}

export default MainFeed