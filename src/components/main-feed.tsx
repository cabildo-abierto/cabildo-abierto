"use client"

import { useState } from "react"
import Feed from "./feed"
import { useFeed } from "@/app/hooks/contents";
import { useUser } from "@/app/hooks/user";


const MainFeed = () => {
    const [following, setFollowing] = useState(false);
    const feed = useFeed()

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
            {feed && 
                <Feed feed={feed} following={following}/>
            }
        </div>
    );
}

export default MainFeed