import { getEntities } from "@/actions/get-entity";
import React from "react"
import { UserSearchResult } from "../buscar/page";



const TopicsPage: React.FC = async () => {
    const entities = await getEntities()

    return (
        <div className="w-full">
            <h2 className="ml-2 py-8">
                República Argentina
            </h2>
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