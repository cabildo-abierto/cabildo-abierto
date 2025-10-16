import {DateSince} from "../../../layout/utils/date"
import {CustomLink as Link} from '../../../layout/utils/custom-link';
import {useRouter, useSearchParams} from "next/navigation"
import React, {useMemo, useState} from "react"
import StateButton from "../../../layout/utils/state-button"
import {AcceptButtonPanel} from "../../../layout/utils/accept-button-panel"
import {ChangesCounter} from "../changes-counter"
import {BaseFullscreenPopup} from "../../../layout/utils/base-fullscreen-popup"
import {ProfilePic} from "../../../profile/profile-pic";
import {ContentOptionsButton} from "@/components/layout/options/content-options-button";
import {getAcceptCount, getRejectCount} from "../utils";
import {getCollectionFromUri, getUri, splitUri, topicUrl} from "@/utils/uri";
import {useTopicHistory} from "@/queries/getters/useTopic";
import LoadingSpinner from "../../../layout/utils/loading-spinner";
import {ErrorPage} from "../../../layout/utils/error-page";
import StarIcon from '@mui/icons-material/Star';
import {useSession} from "@/queries/getters/useSession";
import {IconButton} from "../../../layout/utils/icon-button";
import {VoteEditButtons} from "@/components/topics/topic/history/vote-edit-buttons";
import {addDefaults} from "@/components/topics/topic/topic-props-editor";
import {Authorship} from "@/components/feed/frame/authorship";
import {TopicContributor} from "@/lib/types";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import {ListDashesIcon} from "@phosphor-icons/react";
import DescriptionOnHover from "../../../layout/utils/description-on-hover";
import {TopicPropView} from "../props/topic-props-view";

const EditDetails = ({topicHistory, index}: {
    topicHistory: ArCabildoabiertoWikiTopicVersion.TopicHistory,
    index: number
}) => {
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


export const TopicPropertiesInHistory = ({topicVersion, topic}: {
    topicVersion: ArCabildoabiertoWikiTopicVersion.VersionInHistory,
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
}) => {
    const props = addDefaults(topicVersion.props, topic.id)

    const description = <div className={"space-y-2 text-xs max-w-[300px]"}>
        {props.map((p, index) => {
            return <div key={index}>
                <TopicPropView p={p} />
            </div>
        })}
    </div>

    return <DescriptionOnHover
        description={description}
    >
        <div
            className={"text-[var(--text-light)]"}
            onClick={e => {
                e.stopPropagation()
            }}
        >
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
                        <TopicPropertiesInHistory
                            topicVersion={topicVersion}
                            topic={topic}
                        />
                        <div className={"text-[var(--text-light)]"}>
                            hace <DateSince date={new Date(topicVersion.createdAt)}/>
                        </div>
                        <ContentOptionsButton
                            iconHoverColor={"background-dark2"}
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
                        {claimsAuthorship &&
                            <DescriptionOnHover description={"El usuario es autor del contenido agregado."}>
                            <span className={"text-[var(--text-light)] text-xl"}>
                            <HistoryEduIcon fontSize={"inherit"} fontWeight={300}/>
                            </span>
                            </DescriptionOnHover>}
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
            if (cur) {
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
                <IconButton sx={{padding: 0.25}} size="small" onClick={() => {
                    setOpen(!open)
                }} color="transparent" textColor={"text"}>
                    {!open ? <ArrowDropDownIcon fontSize={"inherit"}/> : <ArrowDropUpIcon fontSize={"inherit"}/>}
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
        <div className={"flex justify-end py-1 px-1"}>
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
