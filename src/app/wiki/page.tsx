import React from "react"
import { ThreeColumnsLayout } from "@/components/main-layout";
import EntityPopup from "@/components/entity-popup";
import { EntityProps } from "@/actions/get-entity";
import { getContentsMap, getEntitiesMap } from "@/components/update-context";
import { EntitySearchResult } from "@/components/entity-search-result";
import { getUser } from "@/actions/get-user";



const TopicsPage: React.FC = async () => {
    const contents = await getContentsMap()
    const entities = await getEntitiesMap()
    const user = await getUser()

    const entityOrder = (a: EntityProps, b: EntityProps) => {
        return Number(contents[b.contentId].text.length != 0) - Number(contents[a.contentId].text.length != 0)
    }

    const sortedEntities = Object.values(entities).sort(entityOrder)

    const center = <div className="w-full">
        <div className="ck-content">
            <h2 className="ml-2 py-8 flex justify-center">
                Artículos colaborativos
            </h2>
        </div>
        <div className="flex justify-center mb-4">
            <EntityPopup user={user}/>
        </div>
        <div className="px-4 w-full">
            {sortedEntities.map((entity, index) => (
                <div key={index} className="mb-2 flex justify-center w-full">
                    <EntitySearchResult entity={entity} content={contents[entity.contentId]}/>
                </div>
            ))}
        </div>
    </div>

    return <ThreeColumnsLayout center={center} />
}
export default TopicsPage