import { DateSince } from "../../../../modules/ui-utils/src/date"
import { CustomLink as Link } from '../../../../modules/ui-utils/src/custom-link';
import {ATProtoStrongRef, TopicHistoryProps, TopicProps} from "@/lib/definitions"
import {useRouter, useSearchParams} from "next/navigation"
import React, {ReactNode, useState} from "react"
import StateButton from "../../../../modules/ui-utils/src/state-button"
import { useSWRConfig } from "swr"
import { AcceptButtonPanel } from "../../../../modules/ui-utils/src/accept-button-panel"
import { toPercentage } from "./show-contributors"
import { ChangesCounter } from "./changes-counter"
import { BaseFullscreenPopup } from "../../../../modules/ui-utils/src/base-fullscreen-popup"
import { Authorship } from "../../feed/content-top-row-author";
import { NeedAccountPopup } from "../../auth/need-account-popup";
import {ProfilePic} from "../../feed/profile-pic";
import {LikeCounter} from "@/components/feed/reactions/like-counter";
import {ContentOptionsButton} from "@/components/feed/content-options/content-options-button";
import {TopicCategories} from "./topic-categories";
import {deleteTopicVersion} from "@/server-actions/topic/current-version";
import {RejectVersionModal} from "./reject-version-modal";
import {getTopicMonetizedChars} from "./utils";
import {getUri, splitUri, topicUrl} from "../../../utils/uri";
import {useTopicHistory} from "../../../hooks/swr";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {ErrorPage} from "../../../../modules/ui-utils/src/error-page";
import {TopicSynonyms} from "./topic-synonyms";
import StarIcon from '@mui/icons-material/Star';
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import {acceptEdit, cancelAcceptEdit, cancelRejectEdit} from "@/server-actions/topic/votes";
import {ReactionButton} from "@/components/feed/reactions/reaction-button";
import {useUser} from "../../../hooks/swr";


const EditDetails = ({topicHistory, index}: {topicHistory: TopicHistoryProps, index: number}) => {

    const topicVersion = topicHistory.versions[index]

    const v = topicVersion.content.topicVersion

    let editType: ReactNode
    if(index == 0){
        editType = "Creación del tema"
    } else if(!topicVersion.content.hasText){
        if(v.title){
            editType = "Nuevo nombre:" + v.title

        } else if(v.categories){
            editType = <div className={"flex space-x-2 items-baseline"}>
                <div>Categorías </div>
                <TopicCategories categories={JSON.parse(v.categories)} containerClassName={"text-sm"}/>
            </div>

        } else if(v.synonyms){
            editType = <div className={"flex space-x-2"}>
                <div>Sinónimos </div>
                <TopicSynonyms
                    synonyms={JSON.parse(v.synonyms)}
                    containerClassName={"text-base"}
                />
            </div>
        } else {
            editType = "Sin cambios"
        }
    } else {
        editType = <div className={"flex space-x-2"}>
            <div>
                Edición
            </div>
            <ChangesCounter charsAdded={v.charsAdded} charsDeleted={v.charsDeleted}/>
        </div>
    }

    return <div className={""}>{editType}</div>
}


const ConfirmEditButtons = ({topicId, versionRef, acceptUri, rejectUri, acceptCount, rejectCount}: {
    topicId: string
    versionRef: ATProtoStrongRef
    acceptUri?: string
    rejectUri?: string
    acceptCount: number
    rejectCount: number
}) => {
    const [openRejectModal, setOpenRejectModal] = useState<boolean>(false)
    const {mutate} = useSWRConfig()
    const [loading, setLoading] = useState(false)

    async function onAcceptEdit(){
        setLoading(true)
        const {error} = await acceptEdit(topicId, versionRef)
        if(error) return {error}
        mutate("/api/topic/"+topicId)
        mutate("/api/topic-history/"+topicId)
        setLoading(false)
        return {}
    }

    async function onCancelAcceptEdit(){
        setLoading(true)
        const {error} = await cancelAcceptEdit(topicId, acceptUri)
        if(error) return {error}
        mutate("/api/topic/"+topicId)
        mutate("/api/topic-history/"+topicId)
        setLoading(false)
        return {}
    }

    async function onCancelRejectEdit(){
        setLoading(true)
        const {error} = await cancelRejectEdit(topicId, rejectUri)
        if(error) return {error}
        mutate("/api/topic/"+topicId)
        mutate("/api/topic-history/"+topicId)
        setLoading(false)
        return {}
    }

    return <div className="flex space-x-2" onClick={(e) => {e.preventDefault(); e.stopPropagation()}}>
        {loading ? <LoadingSpinner size={"14px"} className={""}/> : <><ReactionButton
                onClick={acceptUri ? onCancelAcceptEdit : onAcceptEdit}
                active={false}
                icon1={<CheckIcon fontSize={"inherit"}/>}
                icon2={<CheckIcon fontSize={"inherit"}/>}
                count={acceptCount}
                title={"Aceptar versión."}
            />
            <ReactionButton
            onClick={rejectUri ? onCancelRejectEdit : () => {setOpenRejectModal(true)}}
            active={false}
            icon1={<ClearIcon fontSize={"inherit"}/>}
            icon2={<ClearIcon fontSize={"inherit"}/>}
            count={rejectCount}
            title={"Aceptar versión."}
            />
        </>}
        <RejectVersionModal
            onClose={() => {setOpenRejectModal(false)}}
            open={openRejectModal}
            topicId={topicId}
            versionRef={versionRef}
        />
    </div>
}


const AssignAuthorshipButtons = ({topic, version}: {
    topic: TopicProps, version: number
}) => {
    return <div className="flex space-x-2">
        <LikeCounter
            icon1={<AttachMoneyIcon fontSize={"inherit"}/>}
            icon2={<AttachMoneyIcon fontSize={"inherit"}/>}
            onLike={async () => {
                return {error: "Sin implementar"}
            }}
            onDislike={async () => {
                return {error: "Sin implementar"}
            }}
            initialCount={0}
        />
        <LikeCounter
            icon1={<MoneyOffIcon fontSize={"inherit"}/>}
            icon2={<MoneyOffIcon fontSize={"inherit"}/>}
            onLike={async () => {
                return {error: "Sin implementar"}
            }}
            onDislike={async () => {
                return {error: "Sin implementar"}
            }}
            initialCount={0}
        />
    </div>
}


const EditMessage = ({msg}: { msg?: string }) => {
    return <span className="text-sm">
        {(msg != null && msg.length > 0) ? msg : ""}
    </span>
}


const MonetizationPortion = ({topicHistory, index}: { topicHistory: TopicHistoryProps, index: number }) => {

    const charsAdded = topicHistory.versions[index].content.topicVersion.charsAdded

    let monetizedCharsAdded = getTopicMonetizedChars(topicHistory, topicHistory.versions.length - 1)

    return <span title="Porcentaje sobre las contribuciones monetizadas">
        {toPercentage(charsAdded, monetizedCharsAdded)}%
    </span>
}


const EditElement = ({topic, topicHistory, index, viewing}: {
    topic: TopicProps,
    topicHistory: TopicHistoryProps
    index: number,
    viewing: boolean
}) => {
    const [showingRemoveAuthorshipPanel, setShowingRemoveAuthorshipPanel] = useState(false)
    const router = useRouter()
    const {mutate} = useSWRConfig()

    const isRejected = false

    const topicVersion = topicHistory.versions[index]
    const v = topicVersion.content.topicVersion
    const isCurrent = topic.currentVersion && topic.currentVersion.uri == topicVersion.uri

    const canHaveAuthorship = !v.synonyms && !v.title && !v.categories && index > 0

    let className = "w-full py-1 px-4 flex items-center border-b " + (viewing ? "bg-[var(--background-dark)]" : "")

    className = className + (isRejected ? " bg-red-200 hover:bg-red-300" : " ")

    className = className + (canHaveAuthorship ? " cursor-pointer hover:bg-[var(--background-dark)]" : "")

    return <div className="flex items-center w-full">
        {showingRemoveAuthorshipPanel && <RemoveAuthorshipPanel
            topicHistory={topicHistory}
            version={index}
            onRemove={async () => {return {}}}
            onClose={() => {setShowingRemoveAuthorshipPanel(false)}}
        />}
        <div
            className={className}
            onClick={() => {router.push(topicUrl(topic.id, splitUri(topicHistory.versions[index].uri), "normal"))}}
        >
            <div className={"flex flex-col w-full"}>
                <div className={"flex justify-between items-center w-full"}>
                    <div className="flex items-baseline space-x-1">
                        {isCurrent && <div title="Último contenido aceptado" className={"flex items-baseline"}>
                            <StarIcon color="primary" fontSize={"inherit"}/>
                        </div>}
                        <EditDetails topicHistory={topicHistory} index={index}/>
                        {topicVersion.content.topicVersion.message &&
                            <div className={"text-[var(--text-light)] pl-2 flex items-baseline"}>
                                <EditMessage
                                    msg={topicVersion.content.topicVersion.message}
                                />
                            </div>
                        }
                    </div>
                    <div className="text-xs space-x-2 flex items-center">
                        <div className={"text-[var(--text-light)]"}>
                            <DateSince date={topicVersion.createdAt}/>
                        </div>
                        <ContentOptionsButton
                            record={{...topicVersion}}
                            onDelete={async () => {
                                await deleteTopicVersion(topic, topicHistory, index)
                                mutate("/api/topic/" + topic.id)
                                mutate("/api/topic-history/" + topic.id)
                                mutate("/api/topics-by-categories/popular")
                            }}
                        />
                    </div>
                </div>
                <div className={"flex justify-between w-full space-y-1"}>
                    <div className="flex flex-col w-full mt-2">
                        <div className="text-xs flex space-x-1 text-[var(--text-light)]">
                            <ProfilePic
                                className={"w-4 h-4 rounded-full"}
                                user={topicVersion.author}
                            />
                            <Authorship
                                content={topicVersion}
                                onlyAuthor={true}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {canHaveAuthorship && <AssignAuthorshipButtons topic={topic} version={index}/>}
                        <ConfirmEditButtons
                            topicId={topic.id}
                            versionRef={{uri: topicVersion.uri, cid: topicVersion.cid}}
                            acceptCount={topicVersion.uniqueAccepts}
                            rejectCount={topicVersion.uniqueRejects}
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
}


export const RemoveAuthorshipPanel = ({topicHistory, version, onClose, onRemove}: {
    topicHistory: TopicHistoryProps,
    onClose: () => void,
    version: number,
    onRemove: () => Promise<{ error?: string }>
}) => {
    const {user} = useUser()

    if (!user) {
        return <NeedAccountPopup open={true} onClose={onClose}
                                 text="Necesitás una cuenta para remover la autoría de una edición."/>
    }

    async function handleClick() {
        const {error} = await onRemove()
        if (error) return {error}
        onClose()
        return {}
    }

    const topicVersion = topicHistory.versions[version]

    if (user.editorStatus != "Administrator" && user.did != topicVersion.author.did) {
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
                        {user.did == topicVersion.author.did ? <>Estás por remover la autoría de la
                            modificación que hiciste.</> : <>Estás por remover la autoría de la modificación de
                            @{topicVersion.author.did}.</>}
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
                        />
                    </div>
                </div>
            </BaseFullscreenPopup>
        </>
    );
};


export const EditHistory = ({topic}: { topic: TopicProps }) => {
    const topicHistory = useTopicHistory(topic.id)
    const searchParams = useSearchParams()

    if(topicHistory.isLoading){
        return <div className={"py-4"}>
            <LoadingSpinner/>
        </div>
    }

    if(!topicHistory.topicHistory){
        return <div className={"py-4"}>
            <ErrorPage>
                Ocurrió un error al cargar el historial.
            </ErrorPage>
        </div>
    }

    const history = <div className="hidden min-[800px]:block">
        {topicHistory.topicHistory.versions.map((_, index) => {
        const versionIndex = topicHistory.topicHistory.versions.length-1-index
        return <div key={index} className="w-full">
            <EditElement
                topic={topic}
                topicHistory={topicHistory.topicHistory}
                index={versionIndex}
                viewing={getUri(searchParams.get("did"), "ar.com.cabildoabierto.topic", searchParams.get("rkey")) == topicHistory.topicHistory.versions[versionIndex].uri}
            />
        </div>
    })}</div>

    return <>
        {history}
        <div className="text-sm text-center block min-[800px]:hidden text-[var(--text-light)]">
            <p className={"py-2"}>Para ver el historial entrá a la página desde una pantalla más grande (por ejemplo una computadora).</p>
        </div>
    </>
}
