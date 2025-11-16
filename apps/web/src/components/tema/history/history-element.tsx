import {getAcceptCount, getRejectCount} from "../utils";
import {DateSince} from "@/components/utils/base/date"
import {useRouter} from "next/navigation"
import React from "react"
import {ChangesCounter} from "../changes-counter"
import {ProfilePic} from "../../perfil/profile-pic";
import {getCollectionFromUri, splitUri} from "@cabildo-abierto/utils/dist/uri";
import {VoteEditButtons} from "../votes/vote-edit-buttons";
import {Authorship} from "../../perfil/authorship";
import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"
import {DescriptionOnHover} from "@/components/utils/base/description-on-hover";
import {TopicPropsInHistory} from "../props/topic-props-in-history";
import {ReplyCounter} from "../../feed/utils/reply-counter";
import {StarIcon, XIcon} from "@phosphor-icons/react";
import AuthorshipIcon from "@/components/utils/icons/authorship-icon";
import {cn} from "@/lib/utils";
import {HistoryElementOptionsButton} from "@/components/feed/options/history-element-options-button";
import {topicUrl} from "@/components/utils/react/url";


const EditMessage = ({msg}: { msg?: string }) => {
    return <span className="text-sm truncate text-ellipsis">
        {(msg != null && msg.length > 0) ? msg : ""}
    </span>
}


export const HistoryElement = ({topic, topicHistory, index, onClose}: {
    topic: ArCabildoabiertoWikiTopicVersion.TopicView,
    topicHistory: ArCabildoabiertoWikiTopicVersion.TopicHistory
    index: number
    onClose?: () => void
}) => {
    const router = useRouter()
    const topicVersion = topicHistory.versions[index]
    const isCurrent = topic.currentVersion == topicVersion.uri && topicVersion.status.accepted
    const isInView = topicVersion.uri == topic.uri

    const claimsAuthorship = topicVersion.addedChars > 0 && topicVersion.claimsAuthorship

    const obsolete = getCollectionFromUri(topicVersion.uri) == "ar.com.cabildoabierto.topic"

    return <div
        className={cn(
            "w-full py-1 portal group px-2 hover:bg-[var(--background-dark)] bg-[var(--background)] flex items-center cursor-pointer",
            isInView ? "border border-[var(--accent-dark)]" : ""
        )}
        onClick={() => {
            router.push(topicUrl(topic.id, splitUri(topicHistory.versions[index].uri)))
            if (onClose) onClose()
        }}
    >
        <div className={"flex flex-col w-full"}>
            <div className={"flex justify-between items-center w-full"}>
                <div className="flex space-x-1 items-center">
                    {isCurrent && <DescriptionOnHover
                        description="Último contenido aceptado"
                    >
                        <StarIcon color="var(--text-light)" weight="fill"/>
                    </DescriptionOnHover>}
                    {!topicVersion.status.accepted && <DescriptionOnHover
                        description="Versión rechazada"
                    >
                        <XIcon
                            color={"var(--red-dark2)"}
                            weight="fill"
                        />
                    </DescriptionOnHover>}
                    <ChangesCounter
                        charsAdded={topicVersion.addedChars ?? 0}
                        charsDeleted={topicVersion.removedChars ?? 0}
                        uri={topicVersion.uri}
                        prevUri={topicVersion.prevAccepted}
                        history={topicHistory}
                    />
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
                    <TopicPropsInHistory
                        topicVersion={topicVersion}
                        topic={topic}
                    />
                    <div className={"text-[var(--text-light)]"}>
                        hace <DateSince date={new Date(topicVersion.createdAt)}/>
                    </div>
                    <HistoryElementOptionsButton
                        className={"z-[1501]"}
                        iconSize={"small"}
                        record={{
                            ...topicVersion,
                            $type: "ar.cabildoabierto.wiki.topicVersion#versionInHistory"
                        }}
                    />
                </div>
            </div>
            {topicVersion.message ?
                <div className={"text-[var(--text-light)] h-5 flex items-baseline"}>
                    <EditMessage
                        msg={topicVersion.message}
                    />
                </div> : <div className={"h-5"}/>
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
                    <div
                        onClick={(e) => {
                            e.stopPropagation()
                            router.push(topicUrl(topic.id, splitUri(topicHistory.versions[index].uri)) + "#discusion")
                            if (onClose) onClose()
                        }}>
                        <ReplyCounter
                            count={topicVersion.replyCount}
                            iconSize={"small"}
                            content={{...topicVersion, $type: "ar.cabildoabierto.wiki.topicVersion#versionInHistory"}}
                            textClassName={"text-sm text-[var(--text-light)] font-light"}
                            stopPropagation={false}
                        />
                    </div>
                    {claimsAuthorship &&
                        <DescriptionOnHover description={"El usuario es autor del contenido agregado."}>
                            <span className={"text-[var(--text-light)] text-xl"}>
                                <AuthorshipIcon fontSize={18} weight={"light"}/>
                            </span>
                        </DescriptionOnHover>
                    }
                    <VoteEditButtons
                        iconSize={"small"}
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
}