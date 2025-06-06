import {DateSince} from "../../../../../modules/ui-utils/src/date"
import {CustomLink as Link} from '../../../../../modules/ui-utils/src/custom-link';
import {useRouter, useSearchParams} from "next/navigation"
import React, {useState} from "react"
import StateButton from "../../../../../modules/ui-utils/src/state-button"
import {AcceptButtonPanel} from "../../../../../modules/ui-utils/src/accept-button-panel"
import {toPercentage} from "../show-contributors"
import {ChangesCounter} from "../changes-counter"
import {BaseFullscreenPopup} from "../../../../../modules/ui-utils/src/base-fullscreen-popup"
import {ProfilePic} from "../../../profile/profile-pic";
import {ReactionCounter} from "@/components/feed/frame/reaction-counter";
import {ContentOptionsButton} from "@/components/feed/content-options/content-options-button";
import {getAcceptCount, getRejectCount, getTopicMonetizedChars} from "../utils";
import {getCollectionFromUri, getUri, splitUri, topicUrl} from "@/utils/uri";
import {useTopicHistory} from "@/queries/api";
import LoadingSpinner from "../../../../../modules/ui-utils/src/loading-spinner";
import {ErrorPage} from "../../../../../modules/ui-utils/src/error-page";
import StarIcon from '@mui/icons-material/Star';
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import {useSession} from "@/queries/api";
import {TopicHistory, TopicView, VersionInHistory} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {ModalOnHover} from "../../../../../modules/ui-utils/src/modal-on-hover";
import ListAltIcon from '@mui/icons-material/ListAlt';
import {IconButton} from "../../../../../modules/ui-utils/src/icon-button";
import {TopicProperty} from "@/components/topics/topic/history/topic-property";
import {ConfirmEditButtons} from "@/components/topics/topic/history/confirm-edit-buttons";
import {defaultPropValue} from "@/components/topics/topic/topic-props-editor";
import {isKnownProp, propsEqualValue} from "@/components/topics/topic/utils";
import {Authorship} from "@/components/feed/frame/authorship";


const EditDetails = ({topicHistory, index}: { topicHistory: TopicHistory, index: number }) => {
    const v = topicHistory.versions[index]

    return <ChangesCounter charsAdded={v.addedChars ?? 0} charsDeleted={v.removedChars ?? 0}/>
}


const AssignAuthorshipButtons = ({topic, version}: {
    topic: TopicView, version: number
}) => {
    return <div className="flex space-x-2">
        <ReactionCounter
            iconActive={<AttachMoneyIcon fontSize={"inherit"}/>}
            iconInactive={<AttachMoneyIcon fontSize={"inherit"}/>}
            onAdd={async () => {
            }}
            onRemove={async () => {
            }}
            active={false}
            count={0}
        />
        <ReactionCounter
            iconActive={<MoneyOffIcon fontSize={"inherit"}/>}
            iconInactive={<MoneyOffIcon fontSize={"inherit"}/>}
            onAdd={async () => {
            }}
            onRemove={async () => {
            }}
            active={false}
            count={0}
        />
    </div>
}


const EditMessage = ({msg}: { msg?: string }) => {
    return <span className="text-sm">
        {(msg != null && msg.length > 0) ? msg : ""}
    </span>
}


const MonetizationPortion = ({topicHistory, index}: { topicHistory: TopicHistory, index: number }) => {

    const charsAdded = topicHistory.versions[index].addedChars

    let monetizedCharsAdded = getTopicMonetizedChars(topicHistory, topicHistory.versions.length - 1)

    return <span title="Porcentaje sobre las contribuciones monetizadas">
        {toPercentage(charsAdded, monetizedCharsAdded)}%
    </span>
}


export const TopicProperties = ({topicVersion, topic}: { topicVersion: VersionInHistory, topic: TopicView }) => {
    const props = topicVersion.props != null ? topicVersion.props.filter(
        p => isKnownProp(p.value) && !propsEqualValue(defaultPropValue(p.name, p.value.$type, topic), p.value)
    ) : []

    const modal = <div className={"border rounded bg-[var(--background-dark)] text-[var(--text-light)] p-2 text-sm"}>
        {props.length > 0 && props.map((p, index) => {
            return <div key={index}><TopicProperty p={p}/></div>
        })}
        {props.length == 0 && <div>Ninguna propiedad asignada.</div>}
    </div>

    return <ModalOnHover modal={modal}>
        <div className={"text-[var(--text-light)]"}>
            <IconButton
                size={"small"}
                textColor={"text-light"}
                color={"transparent"}
                hoverColor={"background-dark2"}
            >
                <ListAltIcon color={"inherit"}/>
            </IconButton>
        </div>
    </ModalOnHover>
}


export const HistoryElement = ({topic, topicHistory, index, viewing}: {
    topic: TopicView,
    topicHistory: TopicHistory
    index: number,
    viewing: boolean
}) => {
    const [showingRemoveAuthorshipPanel, setShowingRemoveAuthorshipPanel] = useState(false)
    const router = useRouter()

    const isRejected = false

    const topicVersion = topicHistory.versions[index]
    const isCurrent = topic.currentVersion == topicVersion.uri

    const canHaveAuthorship = true // TO DO

    let className = "w-full py-1 px-4 flex items-center border-b " + (viewing ? "bg-[var(--background-dark)]" : "")

    className = className + (isRejected ? " bg-red-200 hover:bg-red-300" : " ")

    className = className + (canHaveAuthorship ? " cursor-pointer hover:bg-[var(--background-dark)]" : "")

    const obsolete = getCollectionFromUri(topicVersion.uri) == "ar.com.cabildoabierto.topic"

    return <div className="flex items-center w-full">
        {showingRemoveAuthorshipPanel && <RemoveAuthorshipPanel
            topicHistory={topicHistory}
            version={index}
            onRemove={async () => {
                return {}
            }}
            onClose={() => {
                setShowingRemoveAuthorshipPanel(false)
            }}
        />}
        <div
            className={className}
            onClick={() => {
                router.push(topicUrl(topic.id, splitUri(topicHistory.versions[index].uri), "normal"))
            }}
        >
            <div className={"flex flex-col w-full"}>
                <div className={"flex justify-between items-center w-full"}>
                    <div className="flex items-baseline space-x-1">
                        {isCurrent && <div title="Último contenido aceptado" className={"flex items-baseline"}>
                            <StarIcon color="primary" fontSize={"inherit"}/>
                        </div>}
                        <EditDetails topicHistory={topicHistory} index={index}/>
                        {topicVersion.message &&
                            <div className={"text-[var(--text-light)] pl-2 flex items-baseline"}>
                                <EditMessage
                                    msg={topicVersion.message}
                                />
                            </div>
                        }
                        {obsolete && <div className={"text-red-400 pl-2"}>
                            Formato obsoleto
                        </div>}
                    </div>
                    <div className="text-xs space-x-2 flex items-center">
                        <TopicProperties topicVersion={topicVersion} topic={topic}/>
                        <div className={"text-[var(--text-light)]"}>
                            hace <DateSince date={new Date(topicVersion.createdAt)}/>
                        </div>
                        <ContentOptionsButton
                            record={{...topicVersion, $type: "ar.cabildoabierto.wiki.topicVersion#versionInHistory"}}
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
                            acceptCount={getAcceptCount(topicVersion.status)}
                            rejectCount={getRejectCount(topicVersion.status)}
                            acceptUri={topicVersion.viewer.accept}
                            rejectUri={topicVersion.viewer.reject}
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
}


export const RemoveAuthorshipPanel = ({topicHistory, version, onClose, onRemove}: {
    topicHistory: TopicHistory,
    onClose: () => void,
    version: number,
    onRemove: () => Promise<{ error?: string }>
}) => {
    const {user} = useSession()

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


export const EditHistory = ({topic}: { topic: TopicView }) => {
    const {data: topicHistory, isLoading} = useTopicHistory(topic.id)
    const searchParams = useSearchParams()

    if (isLoading) {
        return <div className={"py-4"}>
            <LoadingSpinner/>
        </div>
    }

    if (!topicHistory) {
        return <div className={"py-4"}>
            <ErrorPage>
                Ocurrió un error al cargar el historial.
            </ErrorPage>
        </div>
    }

    const history = <div className="hidden min-[800px]:block">
        {topicHistory.versions.map((_, index) => {
            const versionIndex = topicHistory.versions.length - 1 - index
            return <div key={topicHistory.versions[versionIndex].uri} className="w-full">
                <HistoryElement
                    topic={topic}
                    topicHistory={topicHistory}
                    index={versionIndex}
                    viewing={getUri(searchParams.get("did"), "ar.com.cabildoabierto.topic", searchParams.get("rkey")) == topicHistory.versions[versionIndex].uri}
                />
            </div>
        })}</div>

    return <>
        {history}
        <div className="text-sm text-center block min-[800px]:hidden text-[var(--text-light)]">
            <p className={"py-2"}>Para ver el historial entrá a la página desde una pantalla más grande (por ejemplo una
                computadora).</p>
        </div>
    </>
}
