"use client"

import React from "react"
import Feed from "@/components/feed";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { requireSubscription } from "@/components/utils";
import { useFollowingFeed } from "@/components/use-following-feed";


const Siguiendo: React.FC = () => {
    const {followingFeed, setFollowingFeed} = useFollowingFeed()

    const center = <div className="bg-white h-full">
        <h2 className="ml-2 py-8">
            Siguiendo
        </h2>
        <Feed feed={followingFeed}/>
    </div>

    return requireSubscription(<ThreeColumnsLayout center={center} />, true)
}

export default Siguiendo