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
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { smoothScrollTo } from "./editor/plugins/TableOfContentsPlugin";
import { updateEntityWeakMentions } from "../actions/contents";


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
    const [selectedPanel, setSelectedPanel] = useState(version == undefined ? "none" : "history")
    const [showingNeedAccountPopup, setShowingNeedAccountPopup] = useState(false)
    const router = useRouter()
    const {mutate} = useSWRConfig()

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
            setSelectedPanel("editing")
        } else if(user.user == null){
            setShowingNeedAccountPopup(true)
        }
    }

    function setEditing(v: boolean){
        if(v) setSelectedPanel("editing"); else setSelectedPanel("none")
    }

    const EditButton = () => {
        return <ToggleButton
            text="Editar contenido"
            toggledText="Cancelar edición"
            className={"article-btn lg:text-base text-sm px-1 lg:px-2 bg-[var(--primary)] text-[var(--background)] hover:bg-[var(--primary-dark)]"}
            setToggled={onEdit}
            toggled={selectedPanel == "editing"}
        />
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

    const ViewCategoriesButton = () => {
        return <ToggleButton
            text="Categorías"
            className={articleButtonClassname}
            setToggled={(v) => {if(v) setSelectedPanel("categories"); else setSelectedPanel("none")}}
            toggled={selectedPanel == "categories"}
        />
    }

    const DeleteArticleButton = () => {
        return <StateButton
            className={articleButtonClassname}
            text1="Eliminar tema"
            text2="Eliminando..."
            handleClick={async (e) => {
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
            handleClick={async (e) => {
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
            handleClick={async (e) => {
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
            handleClick={async (e) => {
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
            handleClick={async (e) => {
                if(user.user){
                    await makeEntityPublic(entityId, true); 
                    mutate("/api/entity/"+entityId)
                    return true
                }
                return false
            }}
        />
    }

    const UpdateWeakReferencesButton = () => {
        return <StateButton
            className={articleButtonClassname}
            text1="Actualizar weak references"
            text2="Actualizando..."
            handleClick={async (e) => {
                await updateEntityWeakMentions(entityId)
                return false
            }}
        />
    }

    const MakePrivateButton = () => {
        return <StateButton
            className={articleButtonClassname}
            text1="Hacer privado"
            text2="Haciendo privado..."
            handleClick={async (e) => {
                if(user.user){
                    await makeEntityPublic(entityId, false); 
                    mutate("/api/entity/"+entityId)
                    return true
                }
                return false
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
    if(version == undefined || !inRange(version, versions.length)){
        version = currentIndex
    }
    const isCurrent = version == currentIndex

    const contentId = entity.entity.versions[version].id

    const lastUpdated = entity.entity.versions[entity.entity.versions.length-1].createdAt

    const center = <div className="bg-[var(--background)] h-full px-2">
        {showingNeedAccountPopup && <NeedAccountToEditPopup 
        onClose={() => {setShowingNeedAccountPopup(false)}}/>}
        <div className="flex flex-col">
            <div className="text-[var(--text-light)] text-sm mt-8 mb-2">
                Tema
            </div>
            <h1 className="mb-8 text-lg sm:text-2xl">
                {entity.entity.name}
            </h1>
        </div>
        <div className="flex justify-between items-center">
            <div className="flex flex-col link text-xs sm:text-sm">

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
            <button className="gray-btn sm:text-base text-sm" onClick={onGoToDiscussion}>
                Ir a la discusión <ArrowDownwardIcon fontSize="inherit"/>
            </button>
        </div>
        <div className="">
        {selectedPanel != "editing" && <div className="flex flex-wrap w-full items-center px-2 border-b mt-4 space-x-2">
            <EditButton/>
            <ViewHistoryButton/>
            <ViewCategoriesButton/>
            <ViewLastChangesButton/>
            <ViewAuthorsButton/>
            
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
                <UpdateWeakReferencesButton/>
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
