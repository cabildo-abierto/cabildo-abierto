"use client"
import React from "react"
import { ThreeColumnsLayout } from "@/components/main-layout";
import { EntitySearchResult, UserSearchResult } from "@/components/searchbar";
import { useEntities } from "@/components/use-entities";
import LoadingPage from "@/components/loading-page";
import EntityPopup from "@/components/entity-popup";
import { EntityProps } from "@/actions/get-entity";
import { useContents } from "@/components/use-contents";



const TopicsPage: React.FC = () => {
    const { entities, setEntities } = useEntities()
    const { contents } = useContents()

    if (!entities || !contents) {
        return <LoadingPage />
    }

    const entityOrder = (a: EntityProps, b: EntityProps) => {
        return Number(contents[b.contentId].text.length != 0) - Number(contents[a.contentId].text.length != 0)
    }

    const sortedEntities = Object.values(entities).sort(entityOrder)

    const center = <div className="w-full">
        <h2 className="ml-2 py-8 flex justify-center">
            Artículos de la wiki
        </h2>
        <div className="flex justify-center mb-4">
            <EntityPopup />
        </div>
        <div className="px-4 w-full">
            {sortedEntities.map((entity, index) => (
                <div key={index} className="mb-2 flex justify-center w-full">
                    <EntitySearchResult result={entity} />
                </div>
            ))}
        </div>
    </div>

    return <ThreeColumnsLayout center={center} />
}
export default TopicsPage