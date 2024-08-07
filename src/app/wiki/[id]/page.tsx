import React from "react"
import { ThreeColumnsLayout } from "@/components/main-layout";
import NoEntityPage from "./no-entity-page";
import { ContentWithComments } from "@/components/content-with-comments";
import PaywallChecker from "@/components/paywall-checker";
import { getContentsMap, getEntitiesMap } from "@/components/update-context";


const EntityPage: React.FC<any> = async ({params}) => {
    const entities = await getEntitiesMap()
    const contents = await getContentsMap()

    const entity = entities[params.id]

    if(!entity){
        return <ThreeColumnsLayout center={<NoEntityPage id={params.id}/>}/>
    }

    const center = <div className="bg-white h-full">
        <div className="ck-content">
            <h2 className="ml-2 py-8">
                {entity.name}
            </h2>
        </div>
        <ContentWithComments entity={entity} content={contents[entity.contentId]}/>
    </div>
    
    if(entity.isPublic){
        return <ThreeColumnsLayout center={center}/>
    } else {
        return <PaywallChecker>
            <ThreeColumnsLayout center={center}/>
        </PaywallChecker>
    }
}

export default EntityPage