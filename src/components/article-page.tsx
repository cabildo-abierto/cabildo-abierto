"use client"
import React, { useEffect, useState } from "react"

import { preload, useSWRConfig } from "swr";
import Link from "next/link";
import StateButton from "./state-button";
import { useRouter } from "next/navigation";
import { DateSince } from "./date";
import { ShowContributors } from "./show-contributors";
import { ToggleButton } from "./toggle-button";
import { deleteEntity, deleteEntityHistory, makeEntityPublic, recomputeEntityContributions, renameEntity } from "../actions/entities";
import { useUser } from "../app/hooks/user";
import { EntityCategories } from "./categories";
import { ContentWithCommentsFromId } from "./content-with-comments";
import { EditHistory } from "./edit-history";
import { SetProtectionButton } from "./protection-button";
import { ThreeColumnsLayout } from "./three-columns";
import { articleUrl, currentVersion, inRange, isUndo } from "./utils";
import { UndoDiscussion } from "./undo-discussion";
import { articleButtonClassname } from "./editor/wiki-editor";
import { fetcher } from "../app/hooks/utils";
import { LoadingScreen } from "./loading-screen";
import NoEntityPage from "./no-entity-page";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { useEntity } from "../app/hooks/entities";
import { EntityLikesAndViewsCounter } from "./entity-likes-and-views-counter";


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


export const ArticlePage = ({entityId, version, header, userHeaders}: {
    entityId: string,
    version?: number,
    userHeaders: any,
    header: ReadonlyHeaders
}) => {
    const user = useUser()
    const entity = useEntity(entityId)
    const [editing, setEditing] = useState(false)
    const [showingCategories, setShowingCategories] = useState(false)
    const [showingHistory, setShowingHistory] = useState(version != undefined)
    const [showingChanges, setShowingChanges] = useState(false)
    const [showingAuthors, setShowingAuthors] = useState(false)
    const [showingNeedAccountPopup, setShowingNeedAccountPopup] = useState(false)
    const router = useRouter()
    const {mutate} = useSWRConfig()
    const [validVisit, setValidVisit] = useState(true)

    useEffect(() => {
        if(entity.entity){
            const references = entity.entity.versions[currentVersion(entity.entity)].entityReferences
            for(let i = 0; i < references.length; i++){
                preload("/api/entity/"+references[i].id, fetcher)
            }
        }
    }, [entity])

    if(entity.isLoading){
        return <LoadingScreen/>
    }

    if(!entity.entity || entity.isError || entity.entity.deleted){
        return <NoEntityPage id={entityId}/>
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
                    await deleteEntity(entityId, user.user.id)
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
                await recomputeEntityContributions(entityId)
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
                    await deleteEntityHistory(entityId, false); 
                    mutate("/api/entity/"+entityId)
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
                    await deleteEntityHistory(entityId, true); 
                    mutate("/api/entity/"+entityId)
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
                    await makeEntityPublic(entityId, true); 
                    mutate("/api/entity/"+entityId)
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
                    await makeEntityPublic(entityId, false); 
                    mutate("/api/entity/"+entityId)
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
                    await renameEntity(entityId, user.user.id, "new name"); 
                    mutate("/api/entity/"+entityId)
                    return true
                }
                return false
            }}
        />
    }

    const versions = entity.entity.versions
    const currentIndex = currentVersion(entity.entity)
    if(version == undefined || !inRange(version, versions.length)){
        version = currentIndex
    }
    const isCurrent = version == currentIndex

    const contentId = entity.entity.versions[version].id

    const lastUpdated = entity.entity.versions[entity.entity.versions.length-1].createdAt

    const center = <div className="bg-[var(--background)] h-full px-2">
        {showingNeedAccountPopup && <NeedAccountToEditPopup 
        onClose={() => {setShowingNeedAccountPopup(false)}}/>}
        <div className="text-[var(--text-light)] text-sm mt-8 mb-2">Artículo público</div>
        <h1 className="mb-8">
            {entity.entity.name}
        </h1>
        <div className="flex justify-between">
            <div className="flex flex-col link">

                <ShowContributors entityId={entityId}/>
                
                {isCurrent && <span className="text-[var(--text-light)]">
                    Últ. actualización <DateSince date={lastUpdated}/>.
                </span>}

                {!isCurrent && <div className="flex text-[var(--text-light)]">
                    <span className="mr-1">Estás viendo la versión {version} (publicada <DateSince date={entity.entity.versions[version].createdAt}/>).</span>
                    <span><Link href={articleUrl(entityId)}>Ir a la versión actual</Link>.</span>
                    </div>
                }

            </div>
            <EntityLikesAndViewsCounter 
                contentId={contentId}
            />
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
                {entity.entity.isPublic ? <MakePrivateButton/> : <MakePublicButton/>}
            </div>
            }
        </div>}
        </div>
        {showingCategories && <div className="px-2 content-container my-2">
            <EntityCategories
                categories={versions[version].categories}
                name={entity.entity.name}
            />
        </div>}
        {showingHistory && <div className="my-2">
            <EditHistory
                entity={entity.entity}
                viewing={version}
            />
        </div>
        }

        <div className="mt-2">
        {isUndo(versions[version]) &&
            <UndoDiscussion
                entity={entity.entity}
                version={version}
            />}
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
    
    return <>
        <ThreeColumnsLayout center={center} leftMinWidth="250px"/>
    </>
}
