import React from "react"
import { ThreeColumnsLayout } from "@/components/main-layout";
import NoEntityPage from "../../../components/no-entity-page";
import { ContentWithComments } from "@/components/content-with-comments";
import PaywallChecker from "@/components/paywall-checker";
import { getContentsMap, getEntitiesMap } from "@/components/update-context";
import { getUser } from "@/actions/get-user";
import { SetProtectionButton } from "@/components/protection-button";
import { getSortedVersions } from "@/components/utils";

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

    const sortedVersions = getSortedVersions(entity, contents)
    
    const content = contents[sortedVersions[version].id]

    const center = <div className="bg-white h-full">
        <h1 className="ml-2 py-8">
            {entity.name}
        </h1>
        {(user && user.editorStatus == "Administrator") &&
        <div className="flex justify-center py-2">
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