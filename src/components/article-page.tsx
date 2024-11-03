"use client"
import React, { useEffect, useState } from "react"

import { preload, useSWRConfig } from "swr";
import Link from "next/link";
import StateButton from "./state-button";
import { useRouter, useSearchParams } from "next/navigation";
import { DateSince } from "./date";
import { ToggleButton } from "./toggle-button";
import { recomputeEntityContributions } from "../actions/entities";
import { useUser } from "../app/hooks/user";
import { EntityCategories } from "./categories";
import { ContentWithCommentsFromId } from "./content-with-comments";
import { EditHistory } from "./edit-history";
import { SetProtectionButton } from "./protection-button";
import { ThreeColumnsLayout } from "./three-columns";
import { articleUrl, currentVersion, hasEditPermission, inRange, isUndo } from "./utils";
import { UndoDiscussion } from "./undo-discussion";
import { articleButtonClassname } from "./editor/wiki-editor";
import { fetcher } from "../app/hooks/utils";
import { LoadingScreen } from "./loading-screen";
import NoEntityPage from "./no-entity-page";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { useEntity } from "../app/hooks/entities";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { smoothScrollTo } from "./editor/plugins/TableOfContentsPlugin";
import { updateAllWeakReferences } from "../actions/references";
import { deleteEntity, deleteEntityHistory, makeEntityPublic } from "../actions/admin";
import { BaseFullscreenPopup } from "./base-fullscreen-popup";


const NeedAccountToEditPopup = ({onClose}: {onClose: () => void}) => {
    return <BaseFullscreenPopup>
        <div className="py-4 sm:text-lg text-base">Necesitás una cuenta para hacer ediciones.</div>
        <div className="flex justify-center items-center space-x-4 mt-12 px-6 pb-4 text-sm sm:text-base">
            <button className="gray-btn" onClick={onClose}>
                Seguir leyendo
            </button>
            <Link className="gray-btn" href="/">
                Crear una cuenta o iniciar sesión
            </Link>
        </div>
    </BaseFullscreenPopup>
}


export const editContentClassName = "article-btn lg:text-base text-sm px-1 lg:px-2 bg-[var(--primary)] text-[var(--lightwhite)] hover:bg-[var(--primary-dark)] disabled:hover:bg-[var(--primary)]"


export const ArticlePage = ({entityId, paramsVersion, changes, header, userHeaders}: {
    entityId: string,
    paramsVersion?: number,
    userHeaders: any,
    header: ReadonlyHeaders,
    changes?: boolean
}) => {
    const user = useUser()
    const entity = useEntity(entityId)
    const initialSelection = changes ? "changes" : (paramsVersion == undefined ? "none" : "history")
    const [selectedPanel, setSelectedPanel] = useState(initialSelection)
    const [showingNeedAccountPopup, setShowingNeedAccountPopup] = useState(false)
    const router = useRouter()
    const {mutate} = useSWRConfig()
    const searchParams = useSearchParams()

    useEffect(() => {
        setSelectedPanel(changes ? "changes" : (paramsVersion == undefined ? "none" : "history"))
    }, [searchParams])

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

    if(!entity.entity || entity.isError || entity.entity.deleted || entity.error){
        return <NoEntityPage id={entityId}/>
    }

    async function onEdit(v){
        if(!v || user.user != null){
            setSelectedPanel("editing")
        } else if(user.user == null){
            setShowingNeedAccountPopup(true)
        }
    }

    function setEditing(v: boolean){
        if(v) setSelectedPanel("editing"); else setSelectedPanel("none")
    }

    const EditButton = () => {
        if(hasEditPermission(user.user, entity.entity.protection)){
            return <ToggleButton
                text="Editar contenido"
                toggledText="Cancelar edición"
                className={articleButtonClassname}
                setToggled={onEdit}
                disabled={!isCurrent}
                toggled={selectedPanel == "editing"}
            />
        } else {
            return <ToggleButton
                text="Proponer edición"
                toggledText="Cancelar edición"
                className={articleButtonClassname}
                setToggled={onEdit}
                disabled={!isCurrent}
                toggled={selectedPanel == "editing"}
            />
        }
    }

    const ViewHistoryButton = () => {
        return <ToggleButton
            text="Historial"
            className={articleButtonClassname}
            setToggled={(v) => {if(v) setSelectedPanel("history"); else setSelectedPanel("none")}}
            toggled={selectedPanel == "history"}
        />
    }

    const ViewLastChangesButton = () => {
        return <ToggleButton
            text="Cambios"
            className={articleButtonClassname}
            setToggled={(v) => {if(v) setSelectedPanel("changes"); else setSelectedPanel("none")}}
            toggled={selectedPanel == "changes"}
        />
    }

    const ViewAuthorsButton = () => {
        return <ToggleButton
            text="Autores"
            className={articleButtonClassname}
            setToggled={(v) => {if(v) setSelectedPanel("authors"); else setSelectedPanel("none")}}
            toggled={selectedPanel == "authors"}
        />
    }

    const DeleteArticleButton = () => {
        return <StateButton
            className={articleButtonClassname}
            text1="Eliminar tema"
            text2="Eliminando..."
            handleClick={async (e) => {
                const {error} = await deleteEntity(entityId, user.user.id)
                mutate("/api/entities")
                router.push("/inicio")
                return {error}
            }}
        />
    }

    const RecomputeContributionsButton = () => {
        return <StateButton
            className={articleButtonClassname}
            text1="Recalcular contribuciones"
            text2="Recalculando..."
            handleClick={async (e) => {
                return await recomputeEntityContributions(entityId)
            }}
        />
    }

    const RemoveHistoryButton = () => {
        return <StateButton
            className={articleButtonClassname}
            text1="Eliminar historial"
            text2="Eliminando..."
            handleClick={async (e) => {
                const {error} = await deleteEntityHistory(entityId, false); 
                mutate("/api/entity/"+entityId)
                return {error}
            }}
        />
    }


    const RebootArticleButton = () => {
        return <StateButton
            className={articleButtonClassname}
            text1="Reiniciar"
            text2="Reiniciando..."
            handleClick={async (e) => {
                const {error} = await deleteEntityHistory(entityId, true); 
                mutate("/api/entity/"+entityId)
                return {error}
            }}
        />
    }

    const MakePublicButton = () => {
        return <StateButton
            className={articleButtonClassname}
            text1="Hacer público"
            text2="Haciendo público..."
            handleClick={async (e) => {
                const {error} = await makeEntityPublic(entityId, true); 
                mutate("/api/entity/"+entityId)
                return {error}
            }}
        />
    }

    const UpdateWeakReferencesButton = () => {
        return <StateButton
            className={articleButtonClassname}
            text1="Actualizar weak references"
            text2="Actualizando..."
            handleClick={async (e) => {
                return await updateAllWeakReferences()
            }}
        />
    }

    const MakePrivateButton = () => {
        return <StateButton
            className={articleButtonClassname}
            text1="Hacer privado"
            text2="Haciendo privado..."
            handleClick={async (e) => {
                const {error} = await makeEntityPublic(entityId, false); 
                mutate("/api/entity/"+entityId)
                return {error}
            }}
        />
    }


    /*const RenameEntityButton = () => {
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
    }*/

    function onGoToDiscussion() {
        const targetElement = document.getElementById('discussion-start');

        return smoothScrollTo(targetElement, 300)
    }

    const versions = entity.entity.versions
    const currentIndex = currentVersion(entity.entity)
    let version = paramsVersion
    if(paramsVersion == undefined || !inRange(paramsVersion, versions.length)){
        version = currentIndex
    }
    const isCurrent = version == currentIndex

    const contentId = entity.entity.versions[version].id

    const lastUpdated = entity.entity.versions[entity.entity.versions.length-1].createdAt

    const center = <div className="h-full px-2">
        {showingNeedAccountPopup && <NeedAccountToEditPopup 
        onClose={() => {setShowingNeedAccountPopup(false)}}/>}
        <div className="flex justify-end mt-4">
            {selectedPanel != "editing" && <button className="gray-btn sm:text-base text-sm" onClick={onGoToDiscussion}>
                Ir a la discusión <ArrowDownwardIcon fontSize="inherit"/>
            </button>}
        </div>
        <div className="flex flex-col">
            <div className="text-[var(--text-light)] text-sm mt-1 mb-2">
                Tema
            </div>
            <h1 className="mb-8 text-lg sm:text-2xl">
                {entity.entity.name}
            </h1>
        </div>
        <div className="flex justify-between items-center">
            {selectedPanel != "editing" && <div className="flex flex-col link text-xs sm:text-sm">
                
                {isCurrent && <span className="text-[var(--text-light)]">
                    Últ. actualización <DateSince date={lastUpdated}/>.
                </span>}

                {!isCurrent && <div className="flex text-[var(--text-light)]">
                    <span className="mr-1">Estás viendo la versión {version} (publicada <DateSince date={entity.entity.versions[version].createdAt}/>).</span>
                    <span><Link href={articleUrl(entityId)}>Ir a la versión actual</Link>.</span>
                    </div>
                }

            </div>}
        </div>
        <div className="">
        {selectedPanel != "editing" && <div className="flex flex-wrap w-full items-center px-2 border-b mt-4 space-x-2">
            {isCurrent && <EditButton/>}
            <ViewHistoryButton/>
            <ViewLastChangesButton/>
            <ViewAuthorsButton/>
            
            {(user.user && user.user.editorStatus == "Administrator") && <>
                <div className="flex justify-center py-2">
                    <SetProtectionButton entity={entity}/>
                </div>
                <div className="flex justify-center py-2">
                    <DeleteArticleButton/>
                </div>
                <div className="flex justify-center py-2">
                    <UpdateWeakReferencesButton/>
                </div>
                <div className="flex justify-center py-2">
                    <RemoveHistoryButton/>
                </div>
                <div className="flex justify-center py-2">
                    <RebootArticleButton/>
                </div>
                <div className="flex justify-center py-2">
                    <RecomputeContributionsButton/>
                </div>
                <div className="flex justify-center py-2">
                    {entity.entity.isPublic ? <MakePrivateButton/> : <MakePublicButton/>}
                </div>
                </>
            }
        </div>}
        </div>
        {selectedPanel == "categories" && <div className="px-2 content-container my-2">
            <EntityCategories
                categories={versions[version].categories}
                name={entity.entity.name}
            />
        </div>}
        {selectedPanel == "history" && <div className="my-2">
            <EditHistory
                entity={entity.entity}
                viewing={version}
            />
        </div>
        }

        {isUndo(versions[version]) &&
        <div className="mt-2">
            <UndoDiscussion
                entity={entity.entity}
                version={version}
            />
        </div>}

        <div className="mt-4">
        {selectedPanel == "editing" && <ContentWithCommentsFromId
            contentId={contentId}
            showingChanges={false}
            showingAuthors={false}
            editing={true}
            setEditing={setEditing}
            isMainPage={true}
            inCommentSection={false}
        />}
        {selectedPanel != "editing" && <ContentWithCommentsFromId
            contentId={contentId}
            showingChanges={selectedPanel == "changes"}
            showingAuthors={selectedPanel == "authors"}
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
