import { Authorship } from "./content"
import { DateSince } from "./date"
import { UndoButton } from "./undo-button"
import { CustomLink as Link } from './custom-link';
import { EntityProps, UserProps } from "../app/lib/definitions"
import { useRouter } from "next/navigation"
import { ActiveCommentIcon, AuthorshipClaimIcon, ConfirmEditIcon, NoAuthorshipClaimIcon, RejectEditIcon, UndoIcon, ViewsIcon } from "./icons"
import { useState } from "react"
import StateButton from "./state-button"
import { useUser } from "../app/hooks/user"
import { confirmChanges, rejectChanges, removeEntityAuthorship } from "../actions/entities"
import { articleUrl, currentVersion, getEntityMonetizedChars, hasEditPermission, isUndo } from "./utils"
import { useSWRConfig } from "swr"
import { AcceptButtonPanel } from "./accept-button-panel"
import { NoEditPermissionsMsg } from "./no-edit-permissions-msg"
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import { toPercentage } from "./show-contributors"
import { ChangesCounter } from "./changes-counter"
import { BaseFullscreenPopup } from "./base-fullscreen-popup"


const EditDetails = ({type}: {type: string}) => {
    return <span>{type}</span>
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
            onClick={(e) => {e.stopPropagation(); e.preventDefault(); setShowingRemoveAuthorshipPanel(true)}}
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
    const [pending, setPending] = useState(false)

    async function confirm(e){
        setPending(true)
        if(editPermission){
            const {error} = await confirmChanges(entity.id, contentId, user.id)
            if(error) return {error}
            mutate("/api/entity/"+entity.id)
            mutate("/api/content/"+contentId)
            setPending(false)
            return {}
        } else {
            setShowingNoPermissions(true)
            setPending(false)
            return {}
        }
    }

    async function reject(){
        setPending(true)
        if(editPermission){
            const {error} = await rejectChanges(entity.id, contentId, user.id)
            if(error) return {error}
            mutate("/api/entity/"+entity.id)
            mutate("/api/content/"+contentId)
            setPending(false)
            return {}
        } else {
            setShowingNoPermissions(true)
            setPending(false)
            return {}
        }
    }

    if(!editPermission) return <div className="text-center text-[10px]">
        Sin confirmar
    </div>

    return <div className="flex items-center">
        {showingNoPermissions && 
        <AcceptButtonPanel onClose={() => {setShowingNoPermissions(false)}}>
            <div className="text-base">
                <p>Necesitás permisos de edición para confirmar cambios.</p>
                <NoEditPermissionsMsg user={user} level={entity.protection}/>
            </div>
        </AcceptButtonPanel>}
        {!pending && <><button
            className="hover:scale-105"
            onClick={confirm}
        >
            <ConfirmEditIcon/>
        </button>
        <button
            className="hover:scale-105"
            onClick={reject}
        >
            <RejectEditIcon/>
        </button>
        </>}
    </div>
}


const EditMessage = ({msg, type}: {msg?: string, type: string}) => {
    return <span className="text-sm text-gray-900">
        {(msg != null && msg.length > 0) ? msg : (type == "Contenido" ? "sin descripción" : "")}
    </span>
}


const MonetizationPortion = ({entity, index}: {entity: EntityProps, index: number}) => {

    const charsAdded = entity.versions[index].charsAdded

    let monetizedCharsAdded = getEntityMonetizedChars(entity, entity.versions.length-1)

    return <span title="Porcentaje sobre las contribuciones monetizadas">
        {toPercentage(charsAdded, monetizedCharsAdded)}%
    </span>
}



const EditElement = ({entity, index, viewing, isCurrent}: EditElementProps) => {
    const [showingRemoveAuthorshipPanel, setShowingRemoveAuthorshipPanel] = useState(false)
    const router = useRouter()
    const user = useUser()

    async function onRemoveAuthorship(){
        return await removeEntityAuthorship(entity.versions[index].id, entity.id)
    }

    const selected = viewing == index
    const isUndone = isUndo(entity.versions[index])
    const isRejected = entity.versions[index].rejectedById != null
    const isConfirmed = entity.versions[index].confirmedById != null
    const isPending = !entity.versions[index].editPermission && !isConfirmed && !isRejected
    const isContentChange = index > 0 && (entity.versions[index].charsAdded != 0 || entity.versions[index].charsDeleted != 0)
    const hasAuthorshipClaim = isContentChange && !isUndone && !isPending && !isRejected
    const editPermission = hasEditPermission(user.user, entity.protection)

    async function onDiscussionClick(e){
        e.preventDefault();
        e.stopPropagation();
        if(!selected){
            router.push("/articulo/"+entity.id+"/"+index)
        }
    }

    let baseMsg = null

    if(isUndone){
        baseMsg = <span><UndoIcon/> </span>
    } else if(isCurrent){
        baseMsg = <span><DoubleArrowIcon/></span>
    } else if(isPending){
        baseMsg = <ConfirmEditButtons
        editPermission={editPermission}
        entity={entity}
        contentId={entity.versions[index].id} user={user.user}/>
    } else if(isRejected){
        baseMsg = <span><RejectEditIcon/></span>
    } else {
        baseMsg = <span></span>
    }

    let className = "w-full px-2 py-2 link cursor-pointer mr-1 flex items-center rounded " + (selected ? "border-2" : "border")

    className = className + ((isUndone || isRejected) ? " bg-red-200 hover:bg-red-300" : " hover:bg-[var(--secondary-light)]")

    let type
    if(index == 0){
        type = "Creación"
    } else if(entity.versions[index].compressedText == entity.versions[index-1].compressedText){
        if(entity.versions[index].editMsg.startsWith("nuevo nombre:")){
            type = "Cambio de nombre"
        } else if(entity.versions[index].categories == entity.versions[index-1].categories){
            type = "Sinónimos"
        } else {
            type = "Categorías"
        }
    } else {
        type = "Contenido"
    }

    const entityVersion = entity.versions[index]

    if(entity.versions[index].type == "Comment"){
        return <></>
    }

    return <div className="flex items-center w-full pb-1">
        {<div className={"px-2 " + (selected ? "text-gray-400" : "text-transparent")}>
            <ViewsIcon/>
        </div>}
        <div 
            className={className}
            onClick={() => {router.push(articleUrl(entity.id, index))}}
        >
            {showingRemoveAuthorshipPanel && <RemoveAuthorshipPanel
                entity={entity}
                version={index}
                onRemove={onRemoveAuthorship}
                onClose={() => {setShowingRemoveAuthorshipPanel(false)}}
            />}
            
            <div className="flex items-center space-x-2 w-full">
                
                <div className="text-sm w-12">
                    {baseMsg}
                </div>
                
                <div className="flex flex-col w-full mb-1">
                    <div className="text-xs text-gray-900 flex justify-between w-full items-center">
                        <div className="text-sm">
                            <Authorship
                                content={entityVersion}
                                onlyAuthor={true}
                            />
                        </div>
                        <DateSince date={entityVersion.createdAt}/>
                    </div>
                    
                    <div className="text-sm space-x-2 flex">

                        <div>
                            <ChangesCounter
                                charsAdded={entity.versions[index].charsAdded} charsDeleted={entity.versions[index].charsDeleted}
                            />
                        </div>

                        {index > 0 && <div className="text-[var(--text-light)] hover:underline" onClick={(e) => {e.stopPropagation(); e.preventDefault(); router.push("/articulo?i=" + entity.id + "&v=" + index + "&c=true")}}>
                            Ver cambios
                        </div>}

                        {entity.versions[index].editMsg && 
                            <EditMessage
                                msg={entity.versions[index].editMsg}
                                type={type}
                            />
                        }
                    </div>

                    
                    <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-900">
                            <EditDetails type={type}/>
                        </div>
                        <div className="items-center space-x-2 text-gray-900 flex">
                            {(isCurrent && index > 0) ? <UndoButton entity={entity} version={index}/> : <></>}
                            
                            {(isUndone || isRejected) && <button className="hover:scale-105" onClick={onDiscussionClick}>
                                <ActiveCommentIcon/>
                            </button>}

                            {hasAuthorshipClaim && <AuthorshipClaim entity={entity} version={index} setShowingRemoveAuthorshipPanel={setShowingRemoveAuthorshipPanel}/>}

                            {(hasAuthorshipClaim && entity.versions[index].claimsAuthorship) && <MonetizationPortion
                                entity={entity}
                                index={index}
                            />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}


export const RemoveAuthorshipPanel = ({ entity, version, onClose, onRemove }: {entity: EntityProps, onClose: () => void, version: number, onRemove: () => Promise<{error?: string}>}) => {
    const {user} = useUser()
    const {mutate} = useSWRConfig()

    if(!user){
        return <AcceptButtonPanel onClose={onClose}>
            <span>Necesitás una cuenta para remover la autoría de una edición.</span>
        </AcceptButtonPanel>
    }

    async function handleClick(){
        const {error} = await onRemove()
        if(error) return {error}
        mutate("/api/entity/"+entity.id)
        onClose()
        return {}
    }

    if(user.editorStatus != "Administrator" && user.id != entity.versions[version].author.id){
        return <AcceptButtonPanel onClose={onClose}>
            <div className="">
                <div>
                    Por ahora no podés remover la autoría de ediciones de otros usuarios.
                </div>
                <div className="link">
                    Podés deshacer el cambio, sugerir que se remueva la autoría en un comentario, o hablar directamente con el <Link href="/soporte">soporte</Link>.
                </div>
            </div>
        </AcceptButtonPanel>
    }

    return (
        <>
            <BaseFullscreenPopup>
            <div className="px-6 pb-4">
                <h2 className="py-4 text-lg">Remover autoría de esta versión</h2>
                <div className="mb-8">
                    {user.id == entity.versions[version].author.id ? <>Estás por remover la autoría de la modificación que hiciste.</> : <>Estás por remover la autoría de la modificación de @{entity.versions[version].author.id}.</>}
                </div>
                <div className="flex justify-center items-center space-x-4 mt-4">
                    <button
                        className="gray-btn w-48"
                        onClick={async () => {onClose()}}
                    >
                        Cancelar
                    </button>
                    <StateButton
                        className="gray-btn w-48"
                        handleClick={handleClick}
                        text1="Confirmar"
                        text2="Removiendo..."
                    />
                </div></div>
            </BaseFullscreenPopup>
        </>
    );
};



export const EditHistory = ({entity, viewing}: {entity: EntityProps, viewing?: number}) => {
    const currentIndex = currentVersion(entity)

    const lastDiff = JSON.parse(entity.versions[entity.versions.length-1].diff)
    
    const history = <div className="mt-1 hidden lg:block">
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

    return <>
        {history}
        <div className="text-gray-800 text-sm text-center block lg:hidden">
            <p>Para ver el historial entrá a la página desde una pantalla más grande (por ejemplo una computadora).</p>
        </div>
    </>
}
