import Link from "next/link"
import { Authorship } from "./content"
import { DateSince } from "./date"
import { UndoButton } from "./undo-button"
import LoadingSpinner, { SmallLoadingSpinner } from "./loading-spinner"
import { ContentProps, EntityProps, UserProps } from "../app/lib/definitions"
import { useContent } from "../app/hooks/contents"
import { useRouter } from "next/navigation"
import { ActiveCommentIcon, AuthorshipClaimIcon, ConfirmEditIcon, InactiveCommentIcon, NoAuthorshipClaimIcon, RejectEditIcon, ViewsIcon } from "./icons"
import { useState } from "react"
import StateButton from "./state-button"
import { useUser } from "../app/hooks/user"
import { confirmChanges, rejectChanges, removeEntityAuthorship } from "../actions/entities"
import { User } from "mercadopago"
import { currentVersion, hasEditPermission } from "./utils"
import { useSWRConfig } from "swr"
import { AcceptButtonPanel } from "./accept-button-panel"
import { NoEditPermissionsMsg } from "./no-edit-permissions-msg"

const EditDetails = ({content, prev}: {content: ContentProps, prev: ContentProps | undefined}) => {
    if(!prev){
        return <span>Creación</span>
    } else {
        if(content.text != prev.text){
            return <span>Contenido</span>
        } else if(content.categories != prev.categories){
            return <span>Categorías</span>
        } else {
            return <span>Sin cambios</span>
        }
    }
}

type EditElementProps = {
    entity: EntityProps,
    index: number,
    viewing?: number,
    isCurrent: boolean
}


const AuthorshipClaim = ({entity, version, setShowingRemoveAuthorshipPanel}: {entity: EntityProps, version: number, setShowingRemoveAuthorshipPanel: (v: boolean) => void}) => {
    if(entity.versions[version].claimsAuthorship){
        return <button className="underline hover:text-[var(--primary)] text-xs"
            onClick={(e) => {e.preventDefault(); e.stopPropagation(); setShowingRemoveAuthorshipPanel(true)}}
        >
            <AuthorshipClaimIcon/>
        </button>
    } else {
        return <NoAuthorshipClaimIcon/>
    }
}


const ConfirmEditButtons = ({entity, contentId, user, editPermission}: {entity: EntityProps, contentId: string, user: UserProps, editPermission: boolean}) => {
    const {mutate} = useSWRConfig()
    const [showingNoPermissions, setShowingNoPermissions] = useState(false)

    async function confirm(){
        if(editPermission){
            await confirmChanges(entity.id, contentId, user.id)
            mutate("/api/entity/"+entity.id)
            mutate("/api/content/"+contentId)
        } else {
            setShowingNoPermissions(true)
        }
    }

    async function reject(){
        if(editPermission){
            await rejectChanges(entity.id, contentId, user.id)
            mutate("/api/entity/"+entity.id)
            mutate("/api/content/"+contentId)
        } else {
            setShowingNoPermissions(true)
        }
    }

    return <div className="flex items-center">
        {showingNoPermissions && 
        <AcceptButtonPanel
            text={<div>
                <p>Necesitás permisos de edición para confirmar cambios.</p>
                <NoEditPermissionsMsg user={user} level={entity.protection}/>
            </div>}
            onClose={() => {setShowingNoPermissions(false)}}
        />}
        <StateButton
            className="hover:scale-105"
            onClick={confirm}
            text1={<ConfirmEditIcon/>}
            text2={<SmallLoadingSpinner/>}
            reUsable={!editPermission}
        />
        <StateButton
            className="hover:scale-105"
            onClick={reject}
            text1={<RejectEditIcon/>}
            text2={<SmallLoadingSpinner/>}
            reUsable={!editPermission}
        />
    </div>
}


const EditElement = ({entity, index, viewing, isCurrent}: EditElementProps) => {
    const [showingRemoveAuthorshipPanel, setShowingRemoveAuthorshipPanel] = useState(false)
    const content = useContent(entity.versions[index].id)
    let prev = useContent(entity.versions[Math.max(index-1, 0)].id)
    const router = useRouter()
    const user = useUser()

    if(content.isLoading || prev.isLoading) return <LoadingSpinner/>
    if(!content.content) return <></>

    async function onRemoveAuthorship(){
        await removeEntityAuthorship(entity.versions[index].id, entity.id)
    }

    const selected = viewing == index
    const isUndo = entity.versions[index].isUndo
    const isRejected = entity.versions[index].rejectedById != null
    const isConfirmed = entity.versions[index].confirmedById != null
    const isPending = !entity.versions[index].editPermission && !isConfirmed && !isRejected
    const isContentChange = index > 0 && entity.versions[index].categories == entity.versions[index-1].categories
    const hasAuthorshipClaim = isContentChange && !isUndo && !isRejected
    const editPermission = hasEditPermission(user.user, entity.protection)

    let baseMsg = null

    if(isUndo){
        baseMsg = <span>Deshecho </span>
    } else if(isCurrent){
        baseMsg = <span>Versión oficial</span>
    } else if(isPending){
        baseMsg = <ConfirmEditButtons editPermission={editPermission} entity={entity} contentId={content.content.id} user={user.user}/>
    } else if(isRejected){
        baseMsg = <span>Rechazado</span>
    } else {
        baseMsg = <span>Versión anterior</span>
    }

    let className = "w-full px-2 py-2 link cursor-pointer mr-1 " + (selected ? "border-2" : "border")

    className = className + ((isUndo || isRejected) ? " bg-red-200 hover:bg-red-300" : " hover:bg-[var(--secondary-light)]")
    return <div className="flex items-center w-full pb-1">
        {<div className={"px-2 " + (selected ? "text-gray-400" : "text-transparent")}>
            <ViewsIcon/>
        </div>}
        <div 
            className={className}
            onClick={() => {router.push("/articulo/"+entity.id+"/"+index)}}
        >
            {showingRemoveAuthorshipPanel && <RemoveAuthorshipPanel
                entity={entity}
                version={index}
                onRemove={onRemoveAuthorship}
                onClose={() => {setShowingRemoveAuthorshipPanel(false)}}
            />}
            
            <div className="flex items-center space-x-2 w-full">
                
                <div className="text-sm font-bold w-32">
                    {baseMsg}
                </div>

                <div className="w-32 text-sm">
                    <DateSince date={content.content.createdAt}/>
                </div>
                
                <div className="w-32 text-sm">
                    <Authorship content={content.content} onlyAuthor={true}/>
                </div>
                
                <div className="w-32 text-sm">
                    <EditDetails content={content.content} prev={index > 0 ? prev.content : undefined}/>
                </div>
                
                <div className="w-32 flex items-center space-x-2">
                    {(isCurrent && index > 0) ? <UndoButton entity={entity} version={index}/> : <></>}
                    
                    {isUndo && <button className="hover:scale-105" onClick={(e) => {e.preventDefault(); e.stopPropagation(); router.push("/articulo/"+entity.id+"/"+index)}}>
                        <ActiveCommentIcon/>
                    </button>}

                    {hasAuthorshipClaim && <AuthorshipClaim entity={entity} version={index} setShowingRemoveAuthorshipPanel={setShowingRemoveAuthorshipPanel}/>}
                </div>
            </div>
        </div>
    </div>
}


export const RemoveAuthorshipPanel = ({ entity, version, onClose, onRemove }: {entity: EntityProps, onClose: () => void, version: number, onRemove: () => void}) => {
    const {user} = useUser()

    if(!user){
        return <AcceptButtonPanel text="Necesitás una cuenta para remover la autoría de una edición." onClose={onClose}/>
    }
    return (
        <>
            <div className="cursor-default fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center backdrop-blur-sm">
                
                <div className="bg-[var(--background)] rounded border-2 border-black p-4 z-10 text-center max-w-lg">
                    <h2 className="py-4 text-lg">Remover autoría de esta versión</h2>
                    <div className="mb-8">
                        {user.id == entity.versions[version].authorId ? <>Estás por remover la autoría de la modificación que hiciste.</> : <>Estás por remover la autoría de la modificacióm de @{entity.versions[version].authorId}.</>}
                    </div>
                    <div className="flex justify-center items-center space-x-4 mt-4">
                        <button
                            className="gray-btn w-48"
                            onClick={async () => {onClose()}}
                        >
                            Volver
                        </button>
                        <StateButton
                            className="gray-btn w-48"
                            onClick={async (e) => {e.preventDefault(); e.stopPropagation(); await onRemove(); onClose()}}
                            text1="Confirmar"
                            text2="Removiendo..."
                        />
                    </div>
                </div>
            </div>
        </>
    );
};



export const EditHistory = ({entity, viewing}: {entity: EntityProps, viewing?: number}) => {
    const currentIndex = currentVersion(entity)

    return <div className="mt-1">
        {entity.versions.map((version, index) => {
        const versionIndex = entity.versions.length-1-index
        return <div key={index} className="w-full">
            <EditElement
                entity={entity}
                index={versionIndex}
                viewing={viewing}
                isCurrent={versionIndex == currentIndex}
            />
        </div>
    })}</div>
}
