"use client"
import React, { useState } from "react"

import { ContentWithComments } from "src/components/content-with-comments";
import PaywallChecker from "src/components/paywall-checker";
import { SetProtectionButton } from "src/components/protection-button";
import { useUser } from "src/app/hooks/user";
import { useEntities, useEntity } from "src/app/hooks/entities";
import { ThreeColumnsLayout } from "src/components/three-columns";
import { useSWRConfig } from "swr";
import Link from "next/link";
import { ToggleButton } from "src/components/toggle-button";
import { currentVersion, EditHistory } from "src/components/edit-history";
import { EntityCategories } from "src/components/categories";
import NoEntityPage from "./no-entity-page";
import StateButton from "./state-button";
import { useRouter } from "next/navigation";
import { deleteEntity } from "src/actions/actions";
import LoadingSpinner from "./loading-spinner";
import { LikeCounter } from "./like-counter";
import { ViewsCounter } from "./views-counter";
import { DateSince } from "./date";
import { ShowContributors } from "./show-contributors";



export const ArticlePage = ({entityId, version}: {entityId: string, version?: number}) => {
    const user = useUser()
    const {entity, isLoading, isError} = useEntity(entityId)
    const [editing, setEditing] = useState(false)
    const [showingCategories, setShowingCategories] = useState(false)
    const [showingHistory, setShowingHistory] = useState(version !== undefined)
    const [showingChanges, setShowingChanges] = useState(false)
    const [showingAuthors, setShowingAuthors] = useState(false)
    const router = useRouter()
    const {mutate} = useSWRConfig()

    if(isLoading){
        return <LoadingSpinner/>
    }

    if(isError || !entity){
        return <ThreeColumnsLayout center={<NoEntityPage id={entityId}/>}/>
    }
    const EditButton = () => {
        return <ToggleButton
            text="Editar"
            toggledText="Cancelar edición"
            setToggled={(v) => {setEditing(v); if(v) {setShowingChanges(false); setShowingAuthors(false)}}}
            toggled={editing}
        />
    }

    const ViewHistoryButton = () => {
        return <ToggleButton
            text="Ver historial"
            setToggled={(v) => {setShowingHistory(v)}}
            toggled={showingHistory}
        />
    }

    const ViewLastChangesButton = () => {
        return <ToggleButton
            text="Ver cambios"
            setToggled={(v) => {setShowingChanges(v); if(v) {setEditing(false); setShowingAuthors(false)}}}
            toggled={showingChanges}
        />
    }

    const ViewAuthorsButton = () => {
        return <ToggleButton
            text="Ver autores"
            setToggled={(v) => {setShowingAuthors(v); if(v) {setEditing(false); setShowingChanges(false)}}}
            toggled={showingAuthors}
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
                    mutate("/api/entities")
                    router.push("/inicio");
                }
            }}
        />
    }

    if(version === undefined){
        version = currentVersion(entity)
    }
    const contentId = entity.versions[version].id

    const lastUpdated = entity.versions[entity.versions.length-1].createdAt

    const center = <div className="bg-[var(--background)] h-full">
        <h1 className="ml-2 py-8">
            {entity.name}
        </h1>
        <div className="flex justify-between">
            <div className="flex flex-col link ml-2">
                <span>
                    Últ. actualización <DateSince date={lastUpdated}/>
                </span>
                {version != entity.versions.length-1 && <>
                    <span className="">Estás viendo la versión {version} (publicada <DateSince date={entity.versions[version].createdAt}/>)</span>
                    <Link href={"/articulo/"+entityId}>Ir a la versión actual</Link>
                    </>
                }

                </div>
            <div className="flex flex-col items-end">
                <div className="border rounded p-1 flex">
                    <span className="px-1 flex items-center">Te sirvió el artículo?</span>
                    <LikeCounter
                        contentId={contentId}
                    />
                    </div>
                <ViewsCounter contentId={contentId}/>
            </div>
        </div>
        <div className="ml-2">
            <ShowContributors entityId={entityId} version={version}/>
        </div>
        <div className="flex flex-wrap items-center px-2 py-2 space-x-2">
            <ViewHistoryButton/>
            <ViewCategoriesButton/>
            <ViewLastChangesButton/>
            <ViewAuthorsButton/>
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
        {editing && <ContentWithComments
            contentId={contentId}
            entity={entity} 
            version={version}
            showingChanges={showingChanges}
            showingAuthors={showingAuthors}
            editing={true}
        />}
        {!editing && <ContentWithComments
            contentId={contentId}
            entity={entity} 
            version={version}
            showingChanges={showingChanges}
            showingAuthors={showingAuthors}
            editing={false}
        />}

    </div>
    
    if(entity.isPublic){
        return <ThreeColumnsLayout center={center}/>
    } else {
        return <PaywallChecker>
            <ThreeColumnsLayout center={center}/>
        </PaywallChecker>
    }
}