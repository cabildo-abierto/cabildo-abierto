"use client"
import React, { useState } from "react"

import { useSWRConfig } from "swr";
import Link from "next/link";
import StateButton from "./state-button";
import { useRouter } from "next/navigation";
import { LikeCounter } from "./like-counter";
import { ViewsCounter } from "./views-counter";
import { DateSince } from "./date";
import { ShowContributors } from "./show-contributors";
import { ActivePraiseIcon, InactivePraiseIcon } from "./icons";
import { ToggleButton } from "./toggle-button";
import { deleteEntity, deleteEntityHistory, makeEntityPublic, renameEntity } from "../actions/entities";
import { useUser } from "../app/hooks/user";
import { EntityProps, ContentProps } from "../app/lib/definitions";
import { EntityCategories } from "./categories";
import { ContentWithCommentsFromId } from "./content-with-comments";
import { currentVersion, EditHistory } from "./edit-history";
import PaywallChecker from "./paywall-checker";
import { SetProtectionButton } from "./protection-button";
import { ThreeColumnsLayout } from "./three-columns";
import { NoVisitsAvailablePopup } from "./no-visits-popup";


const DeletedEntity = () => {
    return <div className="flex justify-center mt-16">Esta entidad existía pero fue borrada.</div>
}


export const ArticlePage = ({entity, content, version, visitOK}: {
    entity: EntityProps, content: ContentProps, version?: number, visitOK: boolean}) => {
    const user = useUser()
    const [editing, setEditing] = useState(false)
    const [showingCategories, setShowingCategories] = useState(false)
    const [showingHistory, setShowingHistory] = useState(version != undefined)
    const [showingChanges, setShowingChanges] = useState(false)
    const [showingAuthors, setShowingAuthors] = useState(false)
    const router = useRouter()
    const {mutate} = useSWRConfig()

    if(entity.deleted){
        return <DeletedEntity/>
    }

    async function onEdit(v){
        setEditing(v); 
        if(v) {
            setShowingChanges(false)
            setShowingAuthors(false)
            setShowingHistory(false)
        }
    }

    const EditButton = () => {
        return <ToggleButton
            text="Editar"
            toggledText="Cancelar edición"
            className="article-btn"
            setToggled={onEdit}
            toggled={editing}
            disabled={user.user == null}
            title={user.user == null ? "Necesitás una cuenta para hacer ediciones." : undefined}
        />
    }

    const ViewHistoryButton = () => {
        return <ToggleButton
            text="Historial"
            className="article-btn"
            setToggled={(v) => {setShowingHistory(v)}}
            toggled={showingHistory}
        />
    }

    const ViewLastChangesButton = () => {
        return <ToggleButton
            text="Cambios"
            className="article-btn"
            setToggled={(v) => {setShowingChanges(v); if(v) {setEditing(false); setShowingAuthors(false)}}}
            toggled={showingChanges}
        />
    }

    const ViewAuthorsButton = () => {
        return <ToggleButton
            text="Autores"
            className="article-btn"
            setToggled={(v) => {setShowingAuthors(v); if(v) {setEditing(false); setShowingChanges(false)}}}
            toggled={showingAuthors}
        />
    }

    const ViewCategoriesButton = () => {
        return <ToggleButton
            text="Categorías"
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

    const RemoveHistoryButton = () => {
        return <StateButton
            className="article-btn"
            text1="Eliminar historial"
            text2="Eliminando..."
            onClick={async () => {
                if(user.user){
                    await deleteEntityHistory(entity.id); 
                    mutate("/api/entity/"+entity.id)
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
                <span className="">
                    Últ. actualización <DateSince date={lastUpdated}/>
                </span>
                {version != entity.versions.length-1 && <div className="flex">
                    <span className="mr-1">Estás viendo la versión {version} (publicada <DateSince date={entity.versions[version].createdAt}/>).</span>
                    <span><Link href={"/articulo/"+entity.id}>Versión actual</Link>.</span>
                    </div>
                }
                <ShowContributors contentId={contentId}/>

                </div>
            <div className="flex flex-col items-end">
                <div className="p-1 flex flex-col items-center">
                    <LikeCounter
                        content={content}
                        icon1={<ActivePraiseIcon/>} icon2={<InactivePraiseIcon/>}
                    />
                    <ViewsCounter content={content}/>
                </div>
            </div>
        </div>
        <div className="hidden lg:block">
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
                <RemoveHistoryButton/>
            </div>
            }
            {(user.user && user.user.editorStatus == "Administrator") &&
            <div className="flex justify-center py-2">
                {entity.isPublic ? <MakePrivateButton/> : <MakePublicButton/>}
            </div>
            }
        </div>}
        </div>
        {showingCategories && <div className="px-2 content-container my-2">
            <EntityCategories categories={entity.versions[version].categories} name={entity.name}/>
        </div>}
        {showingHistory && <div className="px-2 content-container my-2">
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
        return <>
            {!visitOK && <NoVisitsAvailablePopup/>}
            <ThreeColumnsLayout center={center}/>
        </>
    }
}