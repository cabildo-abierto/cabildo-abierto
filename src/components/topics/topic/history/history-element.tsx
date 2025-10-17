import {ContentOptionsButton} from "@/components/layout/options/content-options-button";
import {getAcceptCount, getRejectCount} from "../utils";
import {DateSince} from "../../../layout/utils/date"
import {useRouter} from "next/navigation"
import React from "react"
import {ChangesCounter} from "../changes-counter"
import {ProfilePic} from "../../../profile/profile-pic";
import {getCollectionFromUri, splitUri, topicUrl} from "@/utils/uri";
import StarIcon from '@mui/icons-material/Star';
import {VoteEditButtons} from "@/components/topics/topic/history/vote-edit-buttons";
import {Authorship} from "@/components/feed/frame/authorship";
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import DescriptionOnHover from "../../../layout/utils/description-on-hover";
import {TopicPropsInHistory} from "@/components/topics/topic/history/topic-props-in-history";
import {ReplyCounter} from "@/components/feed/frame/reply-counter";


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



export const HistoryElement = ({topic, topicHistory, index}: {
    topic: ArCabildoabiertoWikiTopicVersion.TopicView,
    topicHistory: ArCabildoabiertoWikiTopicVersion.TopicHistory
    index: number
}) => {
    const router = useRouter()
    const topicVersion = topicHistory.versions[index]
    const isCurrent = topic.currentVersion == topicVersion.uri
    const isInView = topicVersion.uri == topic.uri

    const claimsAuthorship = topicVersion.addedChars > 0 && topicVersion.claimsAuthorship

    let className = "w-full py-1 px-4 flex items-center border-b "

    className = className + " cursor-pointer"

    className += isInView ? " bg-[var(--background-dark)] hover:bg-[var(--background-dark2)]" : " hover:bg-[var(--background-dark)] bg-[var(--background)]"

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
                        <TopicPropsInHistory
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
                        <ReplyCounter
                            hoverColor={"background-dark2"}
                            count={topicVersion.replyCount}
                            iconFontSize={18}
                            iconColor={"text-light"}
                            content={{...topicVersion, $type: "ar.cabildoabierto.wiki.topicVersion#versionInHistory"}}
                            textClassName={"text-sm text-[var(--text-light)] font-light"}
                        />
                        {claimsAuthorship &&
                            <DescriptionOnHover description={"El usuario es autor del contenido agregado."}>
                                <span className={"text-[var(--text-light)] text-xl"}>
                                    <HistoryEduIcon fontSize={"inherit"} fontWeight={300}/>
                                </span>
                            </DescriptionOnHover>
                        }
                        <VoteEditButtons
                            backgroundColor={isCurrent ? "background-dark" : "background"}
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