"use client"
import React, { useState } from "react"

import { ContentWithCommentsFromId } from "src/components/content-with-comments";
import PaywallChecker from "src/components/paywall-checker";
import { SetProtectionButton } from "src/components/protection-button";
import { ThreeColumnsLayout } from "src/components/three-columns";
import { useSWRConfig } from "swr";
import Link from "next/link";
import { ToggleButton } from "src/components/toggle-button";
import { currentVersion, EditHistory } from "src/components/edit-history";
import { EntityCategories } from "src/components/categories";
import NoEntityPage from "./no-entity-page";
import StateButton from "./state-button";
import { useRouter } from "next/navigation";
import { deleteEntity, makeEntityPublic, renameEntity } from "src/actions/actions";
import LoadingSpinner from "./loading-spinner";
import { LikeCounter } from "./like-counter";
import { ViewsCounter } from "./views-counter";
import { DateSince } from "./date";
import { ShowContributors } from "./show-contributors";
import { ActivePraiseIcon, InactivePraiseIcon } from "./icons";
import { useUser } from "src/app/hooks/user";
import { useEntity } from "src/app/hooks/entities";


const DeletedEntity = () => {
    return <div className="flex justify-center mt-16">Esta entidad existía pero fue borrada.</div>
}


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

    if(entity.deleted){
        return <DeletedEntity/>
    }

    const EditButton = () => {
        return <ToggleButton
            text="Editar"
            toggledText="Cancelar edición"
            className="article-btn"
            setToggled={(v) => {setEditing(v); if(v) {setShowingChanges(false); setShowingAuthors(false)}}}
            toggled={editing}
            disabled={user.user == null}
            title={user.user == null ? "Necesitás una cuenta para hacer ediciones." : undefined}
        />
    }

    const ViewHistoryButton = () => {
        return <ToggleButton
            text="Ver historial"
            className="article-btn"
            setToggled={(v) => {setShowingHistory(v)}}
            toggled={showingHistory}
        />
    }

    const ViewLastChangesButton = () => {
        return <ToggleButton
            text="Ver cambios"
            className="article-btn"
            setToggled={(v) => {setShowingChanges(v); if(v) {setEditing(false); setShowingAuthors(false)}}}
            toggled={showingChanges}
        />
    }

    const ViewAuthorsButton = () => {
        return <ToggleButton
            text="Ver autores"
            className="article-btn"
            setToggled={(v) => {setShowingAuthors(v); if(v) {setEditing(false); setShowingChanges(false)}}}
            toggled={showingAuthors}
        />
    }

    const ViewCategoriesButton = () => {
        return <ToggleButton
            text="Ver categorías"
            className="article-btn"
            setToggled={(v) => {setShowingCategories(v)}}
            toggled={showingCategories}
        />
    }

    const DeleteArticleButton = () => {
        return <StateButton
            className="article-btn"
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

    const MakePublicButton = () => {
        return <StateButton
            className="article-btn"
            text1="Hacer público"
            text2="Haciendo público..."
            onClick={async () => {
                if(user.user){
                    await makeEntityPublic(entity.id, true); 
                    mutate("/api/entity/"+entity.id)
                }
            }}
        />
    }

    const MakePrivateButton = () => {
        return <StateButton
            className="article-btn"
            text1="Hacer privado"
            text2="Haciendo privado..."
            onClick={async () => {
                if(user.user){
                    await makeEntityPublic(entity.id, false); 
                    mutate("/api/entity/"+entity.id)
                }
            }}
        />
    }

    // TO DO: Terminar de implementar
    const RenameEntityButton = () => {
        return <StateButton
            className="article-btn"
            text1="Renombrar"
            onClick={async () => {
                if(user.user){
                    await renameEntity(entity.id, user.user.id, "new name"); 
                    mutate("/api/entity/"+entity.id)
                }
            }}
        />
    }

    if(version === undefined){
        version = currentVersion(entity)
    }
    const contentId = entity.versions[version].id

    const lastUpdated = entity.versions[entity.versions.length-1].createdAt
    const center = <div className="bg-[var(--background)] h-full px-2">
        <h1 className="py-8">
            {entity.name}
        </h1>
        <div className="flex justify-between">
            <div className="flex flex-col link">
                <span>
                    Últ. actualización <DateSince date={lastUpdated}/>
                </span>
                {version != entity.versions.length-1 && <div className="flex">
                    <span className="mr-1">Estás viendo la versión {version} (publicada <DateSince date={entity.versions[version].createdAt}/>).</span>
                    <span><Link href={"/articulo/"+entityId}>Versión actual</Link>.</span>
                    </div>
                }
                <ShowContributors entityId={entityId} version={version}/>

                </div>
            <div className="flex flex-col items-end">
                <div className="border rounded p-1 flex">
                    <span className="px-1 flex items-center">Te sirvió?</span>
                    <LikeCounter
                        contentId={contentId}
                        icon1={<ActivePraiseIcon/>} icon2={<InactivePraiseIcon/>}
                    />
                </div>
                <ViewsCounter contentId={contentId}/>
            </div>
        </div>
        {!editing && <div className="flex flex-wrap items-center px-2 space-x-2 border-b">
            {<ViewHistoryButton/>}
            {<ViewCategoriesButton/>}
            {<ViewLastChangesButton/>}
            {<ViewAuthorsButton/>}
            {<EditButton/>}
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
            {(user.user && user.user.editorStatus == "Administrator") &&
            <div className="flex justify-center py-2">
                {entity.isPublic ? <MakePrivateButton/> : <MakePublicButton/>}
            </div>
            }
        </div>}
        {showingCategories && <div className="px-4 content-container my-2">
            <EntityCategories categories={entity.versions[version].categories} name={entity.name}/>
        </div>}
        {showingHistory && <div className="px-4 content-container my-2">
            <EditHistory entity={entity} viewing={version}/>
        </div>
        }
        <div className="mt-6">
        {editing && <ContentWithCommentsFromId
            contentId={contentId}
            showingChanges={showingChanges}
            showingAuthors={showingAuthors}
            editing={true}
            setEditing={setEditing}
            isMainPage={true}
            inCommentSection={false}
        />}
        {!editing && <ContentWithCommentsFromId
            contentId={contentId}
            showingChanges={showingChanges}
            showingAuthors={showingAuthors}
            editing={false}
            setEditing={setEditing}
            isMainPage={true}
            inCommentSection={false}
        />}
        </div>

    </div>
    
    if(entity.isPublic){
        return <ThreeColumnsLayout center={center}/>
    } else {
        return <PaywallChecker>
            <ThreeColumnsLayout center={center}/>
        </PaywallChecker>
    }
}