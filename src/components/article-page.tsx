"use client"
import React, { useEffect, useState } from "react"

import { preload, useSWRConfig } from "swr";
import Link from "next/link";
import StateButton from "./state-button";
import { useRouter } from "next/navigation";
import { LikeCounter } from "./like-counter";
import { ViewsCounter } from "./views-counter";
import { DateSince } from "./date";
import { ShowContributors } from "./show-contributors";
import { ActivePraiseIcon, InactivePraiseIcon } from "./icons";
import { ToggleButton } from "./toggle-button";
import { deleteEntity, deleteEntityHistory, makeEntityPublic, recomputeEntityContributions, renameEntity } from "../actions/entities";
import { useUser } from "../app/hooks/user";
import { EntityProps, ContentProps } from "../app/lib/definitions";
import { EntityCategories } from "./categories";
import { ContentWithCommentsFromId } from "./content-with-comments";
import { EditHistory } from "./edit-history";
import { SetProtectionButton } from "./protection-button";
import { ThreeColumnsLayout } from "./three-columns";
import { NoVisitsAvailablePopup } from "./no-visits-popup";
import { currentVersion, isUndo } from "./utils";
import { UndoDiscussion } from "./undo-discussion";
import { articleButtonClassname } from "./editor/wiki-editor";
import { fetcher } from "../app/hooks/utils";


const DeletedEntity = () => {
    return <div className="flex justify-center mt-32">Este artículo existía pero fue borrado.</div>
}


const NeedAccountToEditPopup = ({onClose}: {onClose: () => void}) => {
    return <div className="fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center backdrop-blur-sm">
        <div className="bg-[var(--background)] rounded border-2 border-black p-8 z-10 text-center max-w-lg">
            <div className="py-4 text-lg">Necesitás una cuenta para hacer ediciones.</div>
            <div className="flex justify-center items-center space-x-4 mt-12">
                <button className="gray-btn" onClick={onClose}>
                    Seguir leyendo
                </button>
                <Link className="gray-btn" href="/">
                    Crear una cuenta o iniciar sesión
                </Link>
            </div>
        </div>
    </div>
}


export const ArticlePage = ({entity, content, version, visitOK}: {
    entity: EntityProps, content: ContentProps, version?: number, visitOK: boolean}) => {
    const user = useUser()
    const [editing, setEditing] = useState(false)
    const [showingCategories, setShowingCategories] = useState(false)
    const [showingHistory, setShowingHistory] = useState(version != undefined)
    const [showingChanges, setShowingChanges] = useState(false)
    const [showingAuthors, setShowingAuthors] = useState(false)
    const [showingNeedAccountPopup, setShowingNeedAccountPopup] = useState(false)
    const router = useRouter()
    const {mutate} = useSWRConfig()

    useEffect(() => {
        const references = entity.versions[currentVersion(entity)].entityReferences
        for(let i = 0; i < references.length; i++){
            preload("/api/entity/"+references[i].id, fetcher)
        }
    }, [])

    if(entity.deleted){
        return <DeletedEntity/>
    }

    async function onEdit(v){
        if(!v || user.user != null){
            setEditing(v); 
            if(v) {
                setShowingChanges(false)
                setShowingAuthors(false)
                setShowingHistory(false)
                setShowingCategories(false)
            }
        } else if(user.user == null){
            setShowingNeedAccountPopup(true)
        }
    }

    const EditButton = () => {
        return <ToggleButton
            text="Editar"
            toggledText="Cancelar edición"
            className={articleButtonClassname}
            setToggled={onEdit}
            toggled={editing}
        />
    }

    const ViewHistoryButton = () => {
        return <ToggleButton
            text="Historial"
            className={articleButtonClassname}
            setToggled={(v) => {setShowingHistory(v)}}
            toggled={showingHistory}
        />
    }

    const ViewLastChangesButton = () => {
        return <ToggleButton
            text="Cambios"
            className={articleButtonClassname}
            setToggled={(v) => {setShowingChanges(v); if(v) {setEditing(false); setShowingAuthors(false)}}}
            toggled={showingChanges}
        />
    }

    const ViewAuthorsButton = () => {
        return <ToggleButton
            text="Autores"
            className={articleButtonClassname}
            setToggled={(v) => {setShowingAuthors(v); if(v) {setEditing(false); setShowingChanges(false)}}}
            toggled={showingAuthors}
        />
    }

    const ViewCategoriesButton = () => {
        return <ToggleButton
            text="Categorías"
            className={articleButtonClassname}
            setToggled={(v) => {setShowingCategories(v)}}
            toggled={showingCategories}
        />
    }

    const DeleteArticleButton = () => {
        return <StateButton
            className={articleButtonClassname}
            text1="Eliminar artículo"
            text2="Eliminando..."
            onClick={async (e) => {
                if(user.user){
                    await deleteEntity(entity.id, user.user.id)
                    mutate("/api/entities")
                    router.push("/inicio")
                    return true
                }
                return false
            }}
        />
    }

    const RecomputeContributionsButton = () => {
        return <StateButton
            className={articleButtonClassname}
            text1="Recalcular contribuciones"
            text2="Recalculando..."
            onClick={async (e) => {
                await recomputeEntityContributions(entity.id)
                return false
            }}
        />
    }

    const RemoveHistoryButton = () => {
        return <StateButton
            className={articleButtonClassname}
            text1="Eliminar historial"
            text2="Eliminando..."
            onClick={async (e) => {
                if(user.user){
                    await deleteEntityHistory(entity.id, false); 
                    mutate("/api/entity/"+entity.id)
                    return true
                }
                return false
            }}
        />
    }


    const RebootArticleButton = () => {
        return <StateButton
            className={articleButtonClassname}
            text1="Reiniciar"
            text2="Reiniciando..."
            onClick={async (e) => {
                if(user.user){
                    await deleteEntityHistory(entity.id, true); 
                    mutate("/api/entity/"+entity.id)
                    return true
                }
                return false
            }}
        />
    }

    const MakePublicButton = () => {
        return <StateButton
            className={articleButtonClassname}
            text1="Hacer público"
            text2="Haciendo público..."
            onClick={async (e) => {
                if(user.user){
                    await makeEntityPublic(entity.id, true); 
                    mutate("/api/entity/"+entity.id)
                    return true
                }
                return false
            }}
        />
    }

    const MakePrivateButton = () => {
        return <StateButton
            className={articleButtonClassname}
            text1="Hacer privado"
            text2="Haciendo privado..."
            onClick={async (e) => {
                if(user.user){
                    await makeEntityPublic(entity.id, false); 
                    mutate("/api/entity/"+entity.id)
                    return true
                }
                return false
            }}
        />
    }

    // TO DO: Terminar de implementar
    const RenameEntityButton = () => {
        return <StateButton
            className={articleButtonClassname}
            text1="Renombrar"
            onClick={async (e) => {
                if(user.user){
                    await renameEntity(entity.id, user.user.id, "new name"); 
                    mutate("/api/entity/"+entity.id)
                    return true
                }
                return false
            }}
        />
    }

    if(version === undefined){
        version = currentVersion(entity)
    }
    const contentId = entity.versions[version].id

    const lastUpdated = entity.versions[entity.versions.length-1].createdAt
    const center = <div className="bg-[var(--background)] h-full px-2">
        {showingNeedAccountPopup && <NeedAccountToEditPopup 
        onClose={() => {setShowingNeedAccountPopup(false)}}/>}
        <h1 className="py-8">
            {entity.name}
        </h1>
        <div className="flex justify-between">
            <div className="flex flex-col link">
                <ShowContributors entityId={entity.id}/>
                {version == entity.versions.length-1 && <span className="">
                    Últ. actualización <DateSince date={lastUpdated}/>.
                </span>}
                {version != entity.versions.length-1 && <div className="flex text-[var(--text-light)]">
                    <span className="mr-1">Estás viendo la versión {version} (publicada <DateSince date={entity.versions[version].createdAt}/>).</span>
                    <span><Link href={"/articulo/"+entity.id}>Ir a la versión actual</Link>.</span>
                    </div>
                }

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
        <div className="">
        {!editing && <div className="flex flex-wrap items-center px-2 space-x-2 border-b mt-4">
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
            {(user.user && user.user.editorStatus == "Administrator") &&
            <div className="flex justify-center py-2">
                <RemoveHistoryButton/>
            </div>
            }
            {(user.user && user.user.editorStatus == "Administrator") &&
            <div className="flex justify-center py-2">
                <RebootArticleButton/>
            </div>
            }
            {(user.user && user.user.editorStatus == "Administrator") &&
            <div className="flex justify-center py-2">
                <RecomputeContributionsButton/>
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
        {showingHistory && <div className="content-container my-2">
            <EditHistory entity={entity} viewing={version}/>
        </div>
        }

        <div className="mt-2">
        {isUndo(entity.versions[version]) && <UndoDiscussion content={content} entity={entity} version={version}/>}
        </div>

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
        return <ThreeColumnsLayout center={center} leftMinWidth="250px"/>
    } else {
        return <>
            {!visitOK && <NoVisitsAvailablePopup/>}
            <ThreeColumnsLayout center={center} leftMinWidth="250px"/>
        </>
    }
}