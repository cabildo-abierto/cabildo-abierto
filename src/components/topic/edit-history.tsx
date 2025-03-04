import { DateSince } from "../ui-utils/date"
import { CustomLink as Link } from '../ui-utils/custom-link';
import {TopicProps} from "../../app/lib/definitions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import StateButton from "../ui-utils/state-button"
import { useUser } from "../../hooks/user"
import {topicUrl, countReactions, getCurrentVersion, getTopicMonetizedChars} from "../utils/utils"
import { useSWRConfig } from "swr"
import { AcceptButtonPanel } from "../ui-utils/accept-button-panel"
import { toPercentage } from "./show-contributors"
import { ChangesCounter } from "./changes-counter"
import { BaseFullscreenPopup } from "../ui-utils/base-fullscreen-popup"
import { AuthorshipClaimIcon } from "../icons/authorship-claim-icon";
import { NoAuthorshipClaimIcon } from "../icons/no-authorship-claim-icon";
import { ConfirmEditIcon } from "../icons/confirm-edit-icon";
import { RejectEditIcon } from "../icons/reject-edit-icon";
import { Authorship } from "../feed/content-top-row-author";
import { NeedAccountPopup } from "../auth/need-account-popup";
import {ProfilePic} from "../feed/profile-pic";
import {LikeCounter} from "../reactions/like-counter";
import {ContentOptionsButton} from "../content-options/content-options-button";
import {revalidateTags} from "../../actions/admin";


const EditDetails = ({editType}: {editType: string}) => {
    return <span>{editType}</span>
}

type EditElementProps = {
    entity: TopicProps,
    index: number,
    viewing?: number,
    isCurrent: boolean
}


const ConfirmEditButtons = ({topic, version}: {topic: TopicProps, version: number}) => {
    async function confirm(e){
        /*setPending(true)
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
        }*/
    }

    async function reject(){
        /*setPending(true)
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
        }*/
    }

    return <div className="flex space-x-2">
        <LikeCounter
            icon1={<ConfirmEditIcon/>}
            icon2={<ConfirmEditIcon/>}
            onLike={async () => {return {error: "Sin implementar"}}}
            onDislike={async () => {return {error: "Sin implementar"}}}
            initialCount={countReactions(topic.versions[version].reactions, "ar.com.cabildoabierto.wiki.accept")}
        />
        <LikeCounter
            icon1={<RejectEditIcon/>}
            icon2={<RejectEditIcon/>}
            onLike={async () => {return {error: "Sin implementar"}}}
            onDislike={async () => {return {error: "Sin implementar"}}}
            initialCount={countReactions(topic.versions[version].reactions, "ar.com.cabildoabierto.wiki.reject")}
        />
    </div>
}


const AssignAuthorshipButtons = ({topic, version}: {topic: TopicProps, version: number}) => {
    return <div className="flex space-x-2">
        <LikeCounter
            icon1={<AuthorshipClaimIcon/>}
            icon2={<AuthorshipClaimIcon/>}
            onLike={async () => {
                return {error: "Sin implementar"}
            }}
            onDislike={async () => {
                return {error: "Sin implementar"}
            }}
            initialCount={countReactions(topic.versions[version].reactions, "ar.com.cabildoabierto.wiki.accept")}
        />
        <LikeCounter
            icon1={<NoAuthorshipClaimIcon/>}
            icon2={<NoAuthorshipClaimIcon/>}
            onLike={async () => {
                return {error: "Sin implementar"}
            }}
            onDislike={async () => {
                return {error: "Sin implementar"}
            }}
            initialCount={countReactions(topic.versions[version].reactions, "ar.com.cabildoabierto.wiki.reject")}
        />
    </div>
}


const EditMessage = ({msg, editType}: { msg?: string, editType: string }) => {
    return <span className="text-sm">
        {(msg != null && msg.length > 0) ? msg : (editType == "Contenido" ? "sin descripción" : "")}
    </span>
}


const MonetizationPortion = ({entity, index}: { entity: TopicProps, index: number }) => {

    const charsAdded = entity.versions[index].content.topicVersion.charsAdded

    let monetizedCharsAdded = getTopicMonetizedChars(entity, entity.versions.length - 1)

    return <span title="Porcentaje sobre las contribuciones monetizadas">
        {toPercentage(charsAdded, monetizedCharsAdded)}%
    </span>
}


const EditElement = ({entity, index, viewing, isCurrent}: EditElementProps) => {
    const [showingRemoveAuthorshipPanel, setShowingRemoveAuthorshipPanel] = useState(false)
    const router = useRouter()
    const {mutate} = useSWRConfig()


    async function onRemoveAuthorship(){
        //return await removeEntityAuthorship(entity.versions[index].id, entity.id)
        return {}
    }

    const selected = viewing == index

    const isRejected = false

    const entityVersion = entity.versions[index]
    const entityVersionVersion = entity.versions[index].content.topicVersion


    let editType
    if(index == 0){
        editType = "Creación"
    } else if(entityVersion.content.text == entity.versions[index-1].content.text){
        if(entityVersionVersion.message.startsWith("nuevo nombre:")){
            editType = "Cambio de nombre"
        } else if(entityVersionVersion.categories == entity.versions[index-1].content.topicVersion.categories){
            editType = "Sinónimos"
        } else {
            editType = "Categorías"
        }
    } else {
        editType = "Contenido"
    }


    let className = "w-full px-2 py-2 cursor-pointer flex items-center rounded " + (selected ? "border-2 border-[var(--accent-dark)]" : "border")

    className = className + (isRejected ? " bg-red-200 hover:bg-red-300" : " hover:bg-[var(--background-dark)]")

    return <div className="flex items-center w-full pb-1">
        {showingRemoveAuthorshipPanel && <RemoveAuthorshipPanel
            entity={entity}
            version={index}
            onRemove={onRemoveAuthorship}
            onClose={() => {setShowingRemoveAuthorshipPanel(false)}}
        />}
        <div 
            className={className}
            onClick={() => {router.push(topicUrl(entity.id, index, "normal"))}}
        >
            <div className={"flex flex-col w-full"}>
                <div className={"flex justify-between items-center w-full"}>
                    <div className="text-sm flex space-x-1">
                        <ProfilePic
                            className={"w-5 h-5 rounded-full"}
                            user={entityVersion.author}
                        />
                        <Authorship
                            content={entityVersion}
                            onlyAuthor={true}
                        />
                    </div>
                    <div className="text-xs space-x-2 flex items-center">
                        <div>
                            <DateSince date={entityVersion.createdAt}/>
                        </div>
                        <ContentOptionsButton
                            record={{...entityVersion}}
                            onDelete={async () => {
                                await revalidateTags(["topic:"+entity.id])
                                mutate("/api/topic/"+entity.id)
                            }}
                        />
                    </div>
                </div>
                <div className={"flex justify-between w-full"}>
                    <div className="flex flex-col w-full mt-2">
                        <div className="text-sm">
                            <EditDetails editType={editType}/>
                        </div>
                        <div className="text-[var(--text-light)]">
                            {entity.versions[index].content.topicVersion.message &&
                                <EditMessage
                                    msg={entity.versions[index].content.topicVersion.message}
                                    editType={editType}
                                />
                            }
                        </div>
                        {entity.versions[index].content.topicVersion.diff != undefined && <div className={"flex items-center space-x-1"}>
                            <div>
                                <ChangesCounter
                                    charsAdded={entity.versions[index].content.topicVersion.charsAdded}
                                    charsDeleted={entity.versions[index].content.topicVersion.charsDeleted}
                                />
                            </div>
                            {index > 0 &&
                                <div className="text-[var(--text-light)] text-xs hover:underline" onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    router.push(topicUrl(entity.id, index, "changes"))
                                }}>
                                    Ver cambios
                                </div>
                            }
                        </div>}
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                        <ConfirmEditButtons topic={entity} version={index}/>
                        <AssignAuthorshipButtons topic={entity} version={index}/>
                    </div>
                </div>
            </div>

        </div>
    </div>
}


export const RemoveAuthorshipPanel = ({entity, version, onClose, onRemove}: {
    entity: TopicProps,
    onClose: () => void,
    version: number,
    onRemove: () => Promise<{ error?: string }>
}) => {
    const {user} = useUser()
    const {mutate} = useSWRConfig()

    if (!user) {
        return <NeedAccountPopup open={true} onClose={onClose}
                                 text="Necesitás una cuenta para remover la autoría de una edición."/>
    }

    async function handleClick() {
        const {error} = await onRemove()
        if (error) return {error}
        //mutate("/api/entity/" + entity.id)
        onClose()
        return {}
    }

    if (user.editorStatus != "Administrator" && user.did != entity.versions[version].author.did) {
        return <AcceptButtonPanel open={true} onClose={onClose}>
            <div className="">
                <div>
                    Por ahora no podés remover la autoría de ediciones de otros usuarios.
                </div>
                <div className="link">
                    Podés deshacer el cambio, sugerir que se remueva la autoría en un comentario, o hablar directamente
                    con el <Link href="/soporte">soporte</Link>.
                </div>
            </div>
        </AcceptButtonPanel>
    }

    return (
        <>
            <BaseFullscreenPopup open={true}>
                <div className="px-6 pb-4">
                    <h2 className="py-4 text-lg">Remover autoría de esta versión</h2>
                    <div className="mb-8">
                        {user.did == entity.versions[version].author.did ? <>Estás por remover la autoría de la
                            modificación que hiciste.</> : <>Estás por remover la autoría de la modificación de
                            @{entity.versions[version].author.did}.</>}
                    </div>
                    <div className="flex justify-center items-center space-x-4 mt-4">
                        <button
                            className="gray-btn w-48"
                            onClick={async () => {
                                onClose()
                            }}
                        >
                            Cancelar
                        </button>
                        <StateButton
                            className="gray-btn w-48"
                            handleClick={handleClick}
                            text1="Confirmar"
                            text2="Removiendo..."
                        />
                    </div>
                </div>
            </BaseFullscreenPopup>
        </>
    );
};


export const EditHistory = ({topic, viewing}: { topic: TopicProps, viewing?: number }) => {
    const currentIndex = getCurrentVersion(topic)

    // const lastDiff = JSON.parse(entity.versions[entity.versions.length-1].diff)
    
    const history = <div className="mt-1 hidden lg:block">
        {topic.versions.map((version, index) => {
        const versionIndex = topic.versions.length-1-index
        return <div key={index} className="w-full">
            <EditElement
                entity={topic}
                index={versionIndex}
                viewing={viewing}
                isCurrent={versionIndex == currentIndex}
            />
        </div>
    })}</div>

    return <>
        {history}
        <div className="text-sm text-center block lg:hidden text-[var(--text-light)]">
            <p className={"py-2"}>Para ver el historial entrá a la página desde una pantalla más grande (por ejemplo una computadora).</p>
        </div>
    </>
}
