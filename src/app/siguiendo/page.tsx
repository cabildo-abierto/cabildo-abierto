"use client"

import React from "react"
import Feed from "@/components/feed";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { requireSubscription } from "@/components/utils";


const Siguiendo: React.FC = () => {
    const center = <div className="bg-white h-full">
        <h2 className="ml-2 py-8">
            Siguiendo
        </h2>
        <Feed onlyFollowing={true}/>
    </div>

    return requireSubscription(<ThreeColumnsLayout center={center} />, true)
}

export default Siguiendo