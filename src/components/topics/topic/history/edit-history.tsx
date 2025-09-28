import {DateSince} from "../../../../../modules/ui-utils/src/date"
import {CustomLink as Link} from '../../../../../modules/ui-utils/src/custom-link';
import {useRouter, useSearchParams} from "next/navigation"
import React, {useMemo, useState} from "react"
import StateButton from "../../../../../modules/ui-utils/src/state-button"
import {AcceptButtonPanel} from "../../../../../modules/ui-utils/src/accept-button-panel"
import {ChangesCounter} from "../changes-counter"
import {BaseFullscreenPopup} from "../../../../../modules/ui-utils/src/base-fullscreen-popup"
import {ProfilePic} from "../../../profile/profile-pic";
import {ContentOptionsButton} from "@/components/feed/content-options/content-options-button";
import {getAcceptCount, getRejectCount} from "../utils";
import {getCollectionFromUri, getUri, splitUri, topicUrl} from "@/utils/uri";
import {useTopicHistory} from "@/queries/useTopic";
import LoadingSpinner from "../../../../../modules/ui-utils/src/loading-spinner";
import {ErrorPage} from "../../../../../modules/ui-utils/src/error-page";
import StarIcon from '@mui/icons-material/Star';
import {useSession} from "@/queries/useSession";
import {IconButton} from "../../../../../modules/ui-utils/src/icon-button";
import {TopicProperty} from "@/components/topics/topic/history/topic-property";
import {VoteEditButtons} from "@/components/topics/topic/history/vote-edit-buttons";
import {defaultPropValue} from "@/components/topics/topic/topic-props-editor";
import {isKnownProp, propsEqualValue} from "@/components/topics/topic/utils";
import {Authorship} from "@/components/feed/frame/authorship";
import {TopicContributor} from "@/lib/types";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import {ListDashesIcon} from "@phosphor-icons/react";
import DescriptionOnHover from "../../../../../modules/ui-utils/src/description-on-hover";

const EditDetails = ({topicHistory, index}: { topicHistory: ArCabildoabiertoWikiTopicVersion.TopicHistory, index: number }) => {
    const v = topicHistory.versions[index]

    return <ChangesCounter
        charsAdded={v.addedChars ?? 0}
        charsDeleted={v.removedChars ?? 0}
        uri={v.uri}
        prevUri={v.prevAccepted}
        history={topicHistory}
    />
}


const EditMessage = ({msg}: { msg?: string }) => {
    return <span className="text-sm truncate text-ellipsis">
        {(msg != null && msg.length > 0) ? msg : ""}
    </span>
}


export const TopicProperties = ({topicVersion, topic}: { topicVersion: ArCabildoabiertoWikiTopicVersion.VersionInHistory, topic: ArCabildoabiertoWikiTopicVersion.TopicView }) => {
    const props = topicVersion.props != null ? topicVersion.props.filter(
        p => isKnownProp(p.value) && !propsEqualValue(defaultPropValue(p.name, p.value.$type, topic), p.value)
    ) : []

    const description = <div className={"text-[var(--text-light)] p-2 text-sm"}>
        {props.length > 0 && props.map((p, index) => {
            return <div key={index}><TopicProperty p={p}/></div>
        })}
        {props.length == 0 && <div>Ninguna propiedad asignada.</div>}
    </div>

    return <DescriptionOnHover description={description}>
        <div className={"text-[var(--text-light)]"} onClick={e => {e.stopPropagation()}}>
            <IconButton
                size={"small"}
                textColor={"text-light"}
                color={"transparent"}
                hoverColor={"background-dark2"}
            >
                <ListDashesIcon color={"var(--text-light)"} weight={"regular"}/>
            </IconButton>
        </div>
    </DescriptionOnHover>
}


export const HistoryElement = ({topic, topicHistory, index, viewing}: {
    topic: ArCabildoabiertoWikiTopicVersion.TopicView,
    topicHistory: ArCabildoabiertoWikiTopicVersion.TopicHistory
    index: number,
    viewing: boolean
}) => {
    const router = useRouter()

    const isRejected = false

    const topicVersion = topicHistory.versions[index]
    const isCurrent = topic.currentVersion == topicVersion.uri

    const claimsAuthorship = topicVersion.addedChars > 0 && topicVersion.claimsAuthorship

    let className = "w-full py-1 px-4 flex items-center border-b " + (viewing ? "bg-[var(--background-dark)]" : "")

    className = className + (isRejected ? " bg-red-200 hover:bg-red-300" : " ")

    className = className + " cursor-pointer hover:bg-[var(--background-dark)]"

    const obsolete = getCollectionFromUri(topicVersion.uri) == "ar.com.cabildoabierto.topic"

    return <div className="flex items-center w-full">
        <div
            className={className}
            onClick={() => {
                router.push(topicUrl(topic.id, splitUri(topicHistory.versions[index].uri), "normal"))
            }}
        >
            <div className={"flex flex-col w-full"}>
                <div className={"flex justify-between items-center w-full"}>
                    <div className="flex space-x-1">
                        {isCurrent && <div
                            title="Último contenido aceptado"
                            className={"flex text-[var(--accent-dark)]"}
                        >
                            <StarIcon color="inherit" fontSize={"inherit"}/>
                        </div>}
                        <EditDetails topicHistory={topicHistory} index={index}/>
                        {obsolete && <div className={"text-red-400 pl-2"}>
                            Formato obsoleto
                        </div>}
                    </div>
                    <div className="text-xs space-x-2 flex items-center">
                        <div>
                            <div className={"text-[var(--text-light)]"}>
                                {topicVersion.contribution ? (parseFloat(topicVersion.contribution.all ?? "0") * 100).toFixed(1).toString() + "%" : null}
                            </div>
                        </div>
                        <TopicProperties topicVersion={topicVersion} topic={topic}/>
                        <div className={"text-[var(--text-light)]"}>
                            hace <DateSince date={new Date(topicVersion.createdAt)}/>
                        </div>
                        <ContentOptionsButton
                            record={{...topicVersion, $type: "ar.cabildoabierto.wiki.topicVersion#versionInHistory"}}
                        />
                    </div>
                </div>
                {topicVersion.message &&
                    <div className={"text-[var(--text-light)] flex items-baseline"}>
                        <EditMessage
                            msg={topicVersion.message}
                        />
                    </div>
                }
                <div className={"flex justify-between w-full space-y-1"}>
                    <div className="flex flex-col w-full mt-2">
                        <div className="text-xs flex space-x-1 text-[var(--text-light)]">
                            <ProfilePic
                                className={"w-4 h-4 rounded-full"}
                                user={topicVersion.author}
                            />
                            <Authorship
                                author={topicVersion.author}
                                onlyAuthor={true}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {claimsAuthorship && <span className={"text-[var(--text-light)] text-xl"} title={"El usuario es autor del contenido agregado."}>
                            <HistoryEduIcon fontSize={"inherit"} fontWeight={300}/>
                        </span>}
                        <VoteEditButtons
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
    topicHistory: ArCabildoabiertoWikiTopicVersion.TopicHistory,
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
                        Estás por remover la autoría de tu edición.
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


function getTopicContributors(history: ArCabildoabiertoWikiTopicVersion.TopicHistory): TopicContributor[] {
    const authors = new Map<string, TopicContributor>()

    history.versions.forEach(v => {
        const profile = v.author
        let contribution = v.contribution

        if (contribution) {
            const cur = authors.get(profile.did)
            const all = parseFloat((contribution.all ?? 0).toString())
            const monetized = parseFloat((contribution.monetized ?? 0).toString())
            if(cur){
                authors.set(profile.did, {
                    profile,
                    all: all + cur.all,
                    monetized: monetized + cur.monetized
                })
            } else {
                authors.set(profile.did, {
                    profile,
                    all: all,
                    monetized: monetized
                })
            }
        }
    })

    return Array.from(authors.values())
}


const TopicVersionAuthors = ({topicVersionAuthors}: { topicVersionAuthors: TopicContributor[] }) => {
    const [open, setOpen] = useState(false)

    return <div className={"border px-2 py-1"}>
        <div className={"flex justify-between items-baseline space-x-2"}>
            <div className={"text-sm text-[var(--text-light)]"}>
                Contribuciones
            </div>
            <div className={"text-base"}>
                <IconButton sx={{padding: 0.25}} size="small" onClick={() => {setOpen(!open)}} color="transparent" textColor={"text"}>
                    {!open ? <ArrowDropDownIcon fontSize={"inherit"} /> : <ArrowDropUpIcon fontSize={"inherit"}/>}
                </IconButton>
            </div>
        </div>
        {open && <div className={"text-[var(--text-light)]"}>
            <div className="flex flex-wrap space-x-2 text-sm">
                {topicVersionAuthors.map((c, index) => {
                    return <div key={index}
                                className={"flex space-x-1 items-center rounded-lg"}>
                        <ProfilePic user={c.profile} className={"rounded-full w-4 h-4"}/>
                        <span>({(c.all * 100).toFixed(1)}%)</span>
                    </div>
                })}
            </div>
        </div>}
    </div>
}


export const EditHistory = ({topic}: { topic: ArCabildoabiertoWikiTopicVersion.TopicView }) => {
    const {data: topicHistory, isLoading} = useTopicHistory(topic.id)
    const searchParams = useSearchParams()

    const contributors = useMemo(() => {
        return topicHistory ? getTopicContributors(topicHistory) : undefined
    }, [topicHistory])

    if (isLoading) {
        return <div className={"py-16"}>
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

    return <>
        <div className={"flex justify-end py-1"}>
            <TopicVersionAuthors topicVersionAuthors={contributors}/>
        </div>
        <div className="border-t">
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
            })}
        </div>
    </>
}
