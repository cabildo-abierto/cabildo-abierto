import { getEntityById } from "@/actions/get-entity";
import React from "react"
import { ThreeColumnsLayout } from "@/components/main-layout";
import NoEntityPage from "./no-entity-page";
import { ContentWithComments } from "@/components/content-with-comments";

const EntityPage: React.FC = async ({params}) => {

    const entity = await getEntityById(params.id)
    if(!entity){
        const center = <NoEntityPage id={params.id}/>

        return <ThreeColumnsLayout center={center}/>
    }

    const center = <div className="bg-white h-full">
        <h2 className="ml-2 py-8">
            {entity.entity?.name}
        </h2>
        <ContentWithComments content={entity.content} comments={entity.children} entity={entity.entity}/>
    </div>

    return <ThreeColumnsLayout center={center}/>
}

export default EntityPage