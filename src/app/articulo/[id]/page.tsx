"use client"

import React from "react"
import NoEntityPage from "../../../components/no-entity-page";
import { ContentWithComments } from "@/components/content-with-comments";
import PaywallChecker from "@/components/paywall-checker";
import { SetProtectionButton } from "@/components/protection-button";
import { useUser } from "@/app/hooks/user";
import { useEntities, useEntity } from "@/app/hooks/entities";
import { ThreeColumnsLayout } from "@/components/three-columns";
import { useSWRConfig } from "swr";

const EntityPage: React.FC<{
    params: any,
    searchParams: { [key: string]: string | string[] | undefined }
}> = ({params, searchParams}) => {
    const user = useUser()
    const {entity, isLoading, isError} = useEntity(params.id)

    if(isLoading){
        return <></>
    }

    if(isError || !entity){
        return <ThreeColumnsLayout center={<NoEntityPage id={params.id}/>}/>
    }

    const version = (searchParams.version && typeof searchParams.version == 'string') ? Number(searchParams.version as string) : entity.versions.length-1

    const center = <div className="bg-[var(--background)] h-full">
        <h1 className="ml-2 py-8">
            {entity.name}
        </h1>
        {(user.user && user.user.editorStatus == "Administrator") &&
        <div className="flex justify-center py-2">
            <SetProtectionButton entity={entity}/>
        </div>
        }
        <ContentWithComments
            contentId={entity.versions[version].id}
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