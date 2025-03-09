import { DateSince } from "../ui-utils/date"
import { CustomLink as Link } from '../ui-utils/custom-link';
import {TopicProps, TopicVersionProps} from "../../app/lib/definitions"
import { useRouter } from "next/navigation"
import {ReactNode, useState} from "react"
import StateButton from "../ui-utils/state-button"
import { useUser } from "../../hooks/user"
import {topicUrl, countReactions, getCurrentVersion, getTopicMonetizedChars, PrettyJSON} from "../utils/utils"
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
import {TopicCategories} from "./topic-categories";
import {onDeleteTopicVersion} from "../../actions/topic/current-version";


const EditDetails = ({topic, index}: {topic: TopicProps, index: number}) => {

    const topicVersion = topic.versions[index]

    const v = topicVersion.content.topicVersion

    let editType: ReactNode
    if(index == 0){
        editType = "Creación del tema"
    } else if(topicVersion.content.text == null){
        if(v.title){
            editType = "Nuevo nombre:" + v.title

        } else if(v.categories){
            editType = <div className={"flex space-x-1"}>
                <div>Categorías: </div>
                <TopicCategories categories={JSON.parse(v.categories)}/>
            </div>

        } else if(v.synonyms){
            editType = <div className={"flex space-x-1"}>
                <div>Sinónimos: </div>
                <TopicCategories categories={JSON.parse(v.synonyms)}/>
            </div>
        } else {
            editType = "Sin cambios"
        }
    } else {
        editType = <ChangesCounter charsAdded={v.charsAdded} charsDeleted={v.charsDeleted}/>
    }

    return <div className={"text-[var(--text-light)]"}>{editType}</div>
}

type EditElementProps = {
    topic: TopicProps,
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


const EditMessage = ({msg}: { msg?: string }) => {
    return <span className="text-sm">
        {(msg != null && msg.length > 0) ? msg : ""}
    </span>
}


const MonetizationPortion = ({entity, index}: { entity: TopicProps, index: number }) => {

    const charsAdded = entity.versions[index].content.topicVersion.charsAdded

    let monetizedCharsAdded = getTopicMonetizedChars(entity, entity.versions.length - 1)

    return <span title="Porcentaje sobre las contribuciones monetizadas">
        {toPercentage(charsAdded, monetizedCharsAdded)}%
    </span>
}


const EditElement = ({topic, index, viewing, isCurrent}: EditElementProps) => {
    const [showingRemoveAuthorshipPanel, setShowingRemoveAuthorshipPanel] = useState(false)
    const router = useRouter()
    const {mutate} = useSWRConfig()

    const selected = viewing == index

    const isRejected = false

    const topicVersion = topic.versions[index]

    let className = "w-full px-2 py-2 cursor-pointer flex items-center rounded " + (selected ? "border-2 border-[var(--accent-dark)]" : "border")

    className = className + (isRejected ? " bg-red-200 hover:bg-red-300" : " hover:bg-[var(--background-dark)]")

    return <div className="flex items-center w-full pb-1">
        {showingRemoveAuthorshipPanel && <RemoveAuthorshipPanel
            entity={topic}
            version={index}
            onRemove={async () => {return {}}}
            onClose={() => {setShowingRemoveAuthorshipPanel(false)}}
        />}
        <div 
            className={className}
            onClick={() => {router.push(topicUrl(topic.id, index, "normal"))}}
        >
            <div className={"flex flex-col w-full"}>
                <div className={"flex justify-between items-center w-full"}>
                    <div className="text-sm flex space-x-1">
                        <ProfilePic
                            className={"w-5 h-5 rounded-full"}
                            user={topicVersion.author}
                        />
                        <Authorship
                            content={topicVersion}
                            onlyAuthor={true}
                        />
                    </div>
                    <div className="text-xs space-x-2 flex items-center">
                        <div>
                            <DateSince date={topicVersion.createdAt}/>
                        </div>
                        <ContentOptionsButton
                            record={{...topicVersion}}
                            onDelete={async () => {
                                await onDeleteTopicVersion(topic, index)
                                mutate("/api/topic/"+topic.id)
                                mutate("/api/topics-by-categories/popular")
                            }}
                        />
                    </div>
                </div>
                <div className={"flex justify-between w-full"}>
                    <div className="flex flex-col w-full mt-2">
                        <div className="text-sm">
                            <EditDetails topic={topic} index={index}/>
                        </div>
                        <div className="text-[var(--text-light)]">
                            {topic.versions[index].content.topicVersion.message &&
                                <EditMessage
                                    msg={topic.versions[index].content.topicVersion.message}
                                />
                            }
                        </div>
                        {topic.versions[index].content.topicVersion.diff != undefined && <div className={"flex items-center space-x-1"}>
                            <div>
                                <ChangesCounter
                                    charsAdded={topic.versions[index].content.topicVersion.charsAdded}
                                    charsDeleted={topic.versions[index].content.topicVersion.charsDeleted}
                                />
                            </div>
                            {index > 0 &&
                                <div className="text-[var(--text-light)] text-xs hover:underline" onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    router.push(topicUrl(topic.id, index, "changes"))
                                }}>
                                    Ver cambios
                                </div>
                            }
                        </div>}
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                        <ConfirmEditButtons topic={topic} version={index}/>
                        <AssignAuthorshipButtons topic={topic} version={index}/>
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
    
    const history = <div className="mt-1 hidden lg:block">
        {topic.versions.map((version, index) => {
        const versionIndex = topic.versions.length-1-index
        return <div key={index} className="w-full">
            <EditElement
                topic={topic}
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
