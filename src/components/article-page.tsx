"use client"
import React, { ReactNode, useEffect, useState } from "react"
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { preload, useSWRConfig } from "swr";
import { CustomLink as Link } from './custom-link';
import StateButton from "./state-button";
import { useRouter, useSearchParams } from "next/navigation";
import { DateSince } from "./date";
import { ToggleButton } from "./toggle-button";
import { recomputeEntityContributions } from "../actions/entities";
import { useUser } from "../app/hooks/user";
import { EntityCategories } from "./categories";
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
import { ArticleDiscussion } from "./article-discussion";
import LoadingSpinner from "./loading-spinner";
import { useContent } from "../app/hooks/contents";
import ContentComponent from "./content";
import { Button } from "@mui/material";
import { ArticleOtherOptions } from "./article-other-options";



export const ContentComponentFromId = ({
    contentId,
    ...props
}: {
    contentId: string
    onViewComments?: () => void
    isMainPage?: boolean
    viewingComments?: boolean
    onStartReply?: () => void
    showingChanges?: boolean
    showingAuthors?: boolean
    editing?: boolean
    setEditing: (arg0: boolean) => void
    parentContentId?: string
    inCommentSection?: boolean
    inItsOwnCommentSection?: boolean
    depth?: number
}) => {
    const {content} = useContent(contentId)
    if(!content) return <LoadingSpinner/>

    return <ContentComponent
        content={content}
        {...props}
    />
}



export const NeedAccountPopup = ({open, onClose, text}: {text: ReactNode, open: boolean, onClose: () => void}) => {
    return <BaseFullscreenPopup open={open}>
        <div className="py-6 sm:text-lg text-base text-center px-2">{text}</div>
        <div className="flex justify-center items-center space-x-4 px-6 pb-4 text-sm sm:text-base">
            <Button variant="contained" disableElevation={true} sx={{textTransform: "none"}} onClick={onClose}>
                Seguir leyendo
            </Button>
            <Link href="/">
                <Button variant="contained" disableElevation={true} sx={{textTransform: "none"}}>
                    Crear una cuenta o iniciar sesión
                </Button>
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
                text="Editar"
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
            text1="Eliminar tema"
            text2="Eliminando..."
            variant="text"
            handleClick={async () => {
                const {error} = await deleteEntity(entityId, user.user.id)
                mutate("/api/entities")
                router.push("/inicio")
                return {error}
            }}
        />
    }

    const RecomputeContributionsButton = () => {
        return <StateButton
            variant="text"
            text1="Recalcular contribuciones"
            text2="Recalculando..."
            handleClick={async () => {
                return await recomputeEntityContributions(entityId)
            }}
        />
    }

    const RemoveHistoryButton = () => {
        return <StateButton
            variant="text"
            text1="Eliminar historial"
            text2="Eliminando..."
            handleClick={async () => {
                const {error} = await deleteEntityHistory(entityId, false); 
                mutate("/api/entity/"+entityId)
                return {error}
            }}
        />
    }


    const RebootArticleButton = () => {
        return <StateButton
            variant="text"
            text1="Reiniciar"
            text2="Reiniciando..."
            handleClick={async () => {
                const {error} = await deleteEntityHistory(entityId, true); 
                mutate("/api/entity/"+entityId)
                return {error}
            }}
        />
    }

    const MakePublicButton = () => {
        return <StateButton
            variant="text"
            text1="Hacer público"
            text2="Haciendo público..."
            handleClick={async () => {
                const {error} = await makeEntityPublic(entityId, true); 
                mutate("/api/entity/"+entityId)
                return {error}
            }}
        />
    }

    const UpdateWeakReferencesButton = () => {
        return <StateButton
            variant="text"
            text1="Actualizar weak references"
            text2="Actualizando..."
            handleClick={async () => {
                return await updateAllWeakReferences()
            }}
        />
    }

    const MakePrivateButton = () => {
        return <StateButton
            variant="text"
            text1="Hacer privado"
            text2="Haciendo privado..."
            handleClick={async () => {
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

    const titleFontSize = entity.entity.name.length > 60 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"

    const info = <>
    <div className="flex justify-between items-center">
            {selectedPanel != "editing" && <div className="flex flex-col link text-xs sm:text-sm">
                
                <span className="text-[var(--text-light)] mt-2 flex items-center">
                    <div className="mr-1 flex items-center"><AccessTimeIcon fontSize="inherit"/></div> <span>Última actualización <DateSince date={lastUpdated}/>.</span>
                </span>

                {!isCurrent && <div className="flex text-[var(--text-light)]">
                    <span className="mr-1">Estás viendo la versión {version} (publicada <DateSince date={entity.entity.versions[version].createdAt}/>).</span>
                    <span><Link href={articleUrl(entityId)}>Ir a la versión actual</Link>.</span>
                    </div>
                }

            </div>}
        </div>

        <div className="">
        {selectedPanel != "editing" && <div className="flex flex-wrap w-full items-center border-b mt-4">
            {isCurrent && <EditButton/>}
            <ViewHistoryButton/>
            <ViewLastChangesButton/>
            <ViewAuthorsButton/>
            <ArticleOtherOptions
                optionList={["change-name"]}
                entity={entity.entity}
            />
            
            {(false && user.user && (user.user.editorStatus == "Administrator" || user.user.id == "tomas")) && 
                <div className="flex justify-center">
                    <RecomputeContributionsButton/>
                </div>
            }

            {(user.user && user.user.editorStatus == "Administrator") && <>
                <div className="flex justify-center py-2">
                    <SetProtectionButton entity={entity.entity}/>
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
        {selectedPanel == "editing" && <ContentComponentFromId
            contentId={contentId}
            isMainPage={true}
            showingChanges={false}
            showingAuthors={false}
            editing={true}
            setEditing={setEditing}
        />}
        {selectedPanel != "editing" && <ContentComponentFromId
            contentId={contentId}
            isMainPage={true}
            showingChanges={selectedPanel == "changes"}
            showingAuthors={selectedPanel == "authors"}
            editing={false}
            setEditing={setEditing}
        />}
        </div>
    
    </>

    const center = <div className="flex flex-col items-center w-full">
        <div className="w-full mt-8">
            <NeedAccountPopup
            text="Necesitás una cuenta para hacer ediciones." 
            open={showingNeedAccountPopup}
            onClose={() => {setShowingNeedAccountPopup(false)}}/>

            <div className="flex flex-col rounded content-container p-4 mb-8">
                <div className="text-[var(--text-light)] text-sm mt-1 mb-2">
                    Tema
                </div>
                <h1 className={" " + titleFontSize}>
                    {entity.entity.name}
                </h1>
            </div>
        </div>
        <div className="w-full border rounded-lg content-container p-4 mb-8" id="information-start">
            <div className="flex justify-between mb-2">
                <div>
                    <h2 className="">
                        Información
                    </h2>
                </div>

                <div className="text-[var(--text-light)]">
                    {selectedPanel != "editing" && <Button variant="outlined" onClick={onGoToDiscussion} size="small" color="inherit" endIcon={<ArrowDownwardIcon/>}>
                        Discusión
                    </Button>}
                </div>
            </div>
            <div className="text-[var(--text-light)] text-xs sm:text-sm">
                El consenso fáctico sobre el tema. Si no estás de acuerdo con algo editalo o comentá. También podés agregar información.
            </div>
            {info}
        </div>
        {selectedPanel != "editing" && <div className="w-full" id="discussion-start">
            <ArticleDiscussion
                contentId={contentId}
                entity={entity.entity}
                version={version}
            />
        </div>}
    </div>
    
    return <>
        <ThreeColumnsLayout center={center} leftMinWidth="250px"/>
    </>
}
