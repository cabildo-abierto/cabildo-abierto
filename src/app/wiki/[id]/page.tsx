import { getEntityById } from "@/actions/get-entity";
import React from "react"
import { ThreeColumnsLayout } from "@/components/main-layout";
import NoEntityPage from "./no-entity-page";
import { ContentWithComments } from "@/components/content-with-comments";
import { getUserId } from "@/actions/get-user";
import { requireSubscription } from "@/components/utils";


const EntityPage: React.FC<any> = async ({params}) => {
    const entity = await getEntityById(params.id, await getUserId())
    if(!entity){
        const center = <NoEntityPage id={params.id}/>

        return <ThreeColumnsLayout center={center}/>
    }

    const center = <div className="bg-white h-full">
        <div className="ck-content">
            <h2 className="ml-2 py-8">
                {entity.entity?.name}
            </h2>
        </div>
        <ContentWithComments content={entity.content} comments={entity.children} entity={entity.entity}/>
    </div>

    
    return requireSubscription(<ThreeColumnsLayout center={center}/>, !entity.entity.isPublic)
}

export default EntityPage