import { getEntities } from "@/actions/get-entity";
import Link from "next/link";
import React from "react"
import { UserSearchResult } from "../buscar/page";



const TopicsPage: React.FC = async () => {
    const entities = await getEntities()

    return (
        <div className="w-full">
            <h1 className="text-2xl ml-2 py-8 font-semibold mb-8">
                República Argentina
            </h1>
            <div className="px-4 w-full">
            {entities.map((entity, index) => (
                <div key={index} className="mb-2 flex justify-center w-full">
                    <UserSearchResult result={entity} isEntity={true}/>
                </div>
            ))}
            </div>
        </div>
    )
}
export default TopicsPage