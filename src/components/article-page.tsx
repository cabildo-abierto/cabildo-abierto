"use client"
import React, { useState } from "react"

import { ContentWithComments } from "@/components/content-with-comments";
import PaywallChecker from "@/components/paywall-checker";
import { SetProtectionButton } from "@/components/protection-button";
import { useUser } from "@/app/hooks/user";
import { useEntities, useEntity } from "@/app/hooks/entities";
import { ThreeColumnsLayout } from "@/components/three-columns";
import { useSWRConfig } from "swr";
import Link from "next/link";
import { ToggleButton } from "@/components/toggle-button";
import { currentVersion, EditHistory } from "@/components/edit-history";
import { EntityCategories } from "@/components/categories";
import NoEntityPage from "./no-entity-page";
import StateButton from "./state-button";
import { useRouter } from "next/navigation";
import { deleteEntity } from "@/actions/create-entity";


export const ArticlePage = ({entityId, version}: {entityId: string, version?: number}) => {
    const user = useUser()
    const {entity, isLoading, isError} = useEntity(entityId)
    const [showingCategories, setShowingCategories] = useState(false)
    const [showingHistory, setShowingHistory] = useState(version !== undefined)
    const router = useRouter()
    const {mutate} = useSWRConfig()

    if(isLoading){
        return <></>
    }

    if(isError || !entity){
        return <ThreeColumnsLayout center={<NoEntityPage id={entityId}/>}/>
    }
    const EditButton = () => {
        return <Link href={"/articulo/"+entity.id+"/edit"}>
            <button
                className="gray-btn"
            >
                Editar
            </button>
        </Link>
    }

    const ViewHistoryButton = () => {
        return <ToggleButton
            text="Ver historial"
            setToggled={(v) => {setShowingHistory(v)}}
            toggled={showingHistory}
        />
    }

    const ViewCategoriesButton = () => {
        return <ToggleButton
            text="Ver categorías"
            setToggled={(v) => {setShowingCategories(v)}}
            toggled={showingCategories}
        />
    }

    const DeleteArticleButton = () => {
        return <StateButton
            className="gray-btn"
            text1="Eliminar artículo"
            text2="Eliminando..."
            onClick={async () => {
                if(user.user){
                    await deleteEntity(entity.id, user.user.id); 
                    router.push("/inicio");
                    mutate("/api/entities")
                    mutate("/api/contents")
                }
            }}
        />
    }

    if(version === undefined){
        version = currentVersion(entity)
    }
    const contentId = entity.versions[version].id

    const center = <div className="bg-[var(--background)] h-full">
        <h1 className="ml-2 py-8">
            {entity.name}
        </h1>
        <div className="flex flex-wrap items-center px-2 py-2 space-x-2">
            <ViewHistoryButton/>
            <ViewCategoriesButton/>
            <EditButton/>
            {(user.user && user.user.editorStatus == "Administrator") &&
            <div className="flex justify-center py-2">
                <SetProtectionButton entity={entity}/>
            </div>
            }
            {(user.user && user.user.editorStatus == "Administrator") &&
            <div className="flex justify-center py-2">
                <DeleteArticleButton/>
            </div>
            }
        </div>
        {showingCategories && <div className="px-4">
        <EntityCategories categories={entity.versions[version].categories}/>
        </div>}
        {showingHistory && <div className="px-4">
            <EditHistory entity={entity} viewing={version}/>
        </div>
        }

        <ContentWithComments
            contentId={contentId}
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