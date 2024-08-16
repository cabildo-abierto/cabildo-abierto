import React from "react"
import { ThreeColumnsLayout } from "@/components/main-layout";
import NoEntityPage from "./no-entity-page";
import { ContentWithComments } from "@/components/content-with-comments";
import PaywallChecker from "@/components/paywall-checker";
import { getContentsMap, getEntitiesMap } from "@/components/update-context";
import { getUser } from "@/actions/get-user";
import { SetProtectionButton } from "@/components/protection-button";
import { entityLastVersionId } from "@/components/utils";


const EntityPage: React.FC<{
    params: any,
    searchParams: { [key: string]: string | string[] | undefined }
}> = async ({params, searchParams}) => {
    const entities = await getEntitiesMap()
    const contents = await getContentsMap()
    const user = await getUser()

    const entity = entities[params.id]

    if(!entity){
        return <ThreeColumnsLayout center={<NoEntityPage user={user} id={params.id}/>}/>
    }

    const version = typeof searchParams.version == 'string' ? Number(searchParams.version as string) : entity.versions.length-1

    const sortedVersions = entity.versions.sort((a: { id: string }, b: { id: string }) => {
        return (new Date(contents[a.id].createdAt).getTime()) - (new Date(contents[b.id].createdAt).getTime());
    });
    
    const content = contents[sortedVersions[version].id]

    const center = <div className="bg-white h-full">
        <h1 className="ml-2 py-8">
            {entity.name}
        </h1>
        {(user && user.editorStatus == "Administrator") &&
        <div className="flex justify-center">
            <SetProtectionButton entity={entity}/>
        </div>
        }
        <ContentWithComments
            user={user}
            content={content}
            contents={contents}
            entity={entity} 
        />
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