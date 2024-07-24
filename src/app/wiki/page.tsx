"use client"
import React from "react"
import { ThreeColumnsLayout } from "@/components/main-layout";
import { UserSearchResult } from "@/components/searchbar";
import { useEntities } from "@/components/use-entities";
import LoadingPage from "@/components/loading-page";



const TopicsPage: React.FC = () => {
    const {entities, setEntities} = useEntities()
    if(!entities) {
        return <LoadingPage/>
    }

    const center = <div className="w-full">
        <h2 className="ml-2 py-8 flex justify-center">
            Artículos de la wiki
        </h2>
        <div className="px-4 w-full">
        {Object.values(entities).map((entity, index) => (
            <div key={index} className="mb-2 flex justify-center w-full">
                <UserSearchResult result={entity} isEntity={true}/>
            </div>
        ))}
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}
export default TopicsPage