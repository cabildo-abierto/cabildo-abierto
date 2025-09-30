import {getUsername} from "@/utils/utils";
import {DateSince} from "../../../modules/ui-utils/src/date";
import {ProfilePic} from "@/components/profile/profile-pic";
import {AtIcon, CheckIcon, UserPlusIcon, XIcon} from "@phosphor-icons/react";
import {HeartIcon} from "@phosphor-icons/react";
import {QuotesIcon} from "@phosphor-icons/react";
import {ChatTextIcon} from "@phosphor-icons/react";
import {ReactNode} from "react";
import {
    ArticleKind,
    collectionToDisplay,
    contentUrl,
    getCollectionFromUri,
    getDidFromUri,
    profileUrl, topicUrl
} from "@/utils/uri";
import Link from "next/link";
import {useRouter} from "next/navigation";
import TopicsIcon from "@/components/layout/icons/topics-icon";
import {ArCabildoabiertoNotificationListNotifications} from "@/lex-api/index"
import { RepostIcon } from "../layout/icons/reposts-icon";


const Username = ({user}: { user: {displayName?: string, handle: string, did: string} }) => {
    return <span className={"font-bold hover:underline"}>
        {getUsername(user)}
    </span>
}


const NotificationCardFrame = ({read, reasonIcon, children, href}: {
    read: boolean,
    reasonIcon: ReactNode,
    children: ReactNode,
    href?: string
}) => {
    const router = useRouter()
    return <div
        className={"border-b h-24 px-4 flex space-x-4 py-2 text-[var(--text)] cursor-pointer hover:bg-[var(--background-dark)] " + (!read ? "bg-[var(--background-dark)]" : "")}
        onClick={() => {
            if (href) router.push(href)
        }}
    >
        <div className={"flex items-center"}>
            {reasonIcon}
        </div>

        {children}
    </div>
}


const UserNotificationCard = ({notification, children, reasonIcon, href}: {
    notification: ArCabildoabiertoNotificationListNotifications.Notification, children: ReactNode, reasonIcon: ReactNode, href?: string
}) => {
    return <NotificationCardFrame
        read={notification.isRead}
        reasonIcon={reasonIcon}
        href={href}
    >
        <div className={"flex justify-between w-full text-xs sm:text-sm"}>
            <div className={"flex space-x-2 items-center w-full"}>
                <ProfilePic user={notification.author} className={"rounded-full h-6 w-6"}/>

                <div className={"max-w-[70%]"}>
                    {children}
                </div>
            </div>

            <div className={"w-full flex items-end space-x-1 flex-1 pr-1"}>
                <span>
                    Hace
                </span>
                <span className="text-[var(--text-light)] flex-shrink-0">
                    <DateSince date={notification.indexedAt}/>
                </span>
            </div>

        </div>
    </NotificationCardFrame>
}


const ContentMention = ({uri, article, topicId}: {
    uri: string
    article: ArticleKind
    topicId?: string
}) => {
    if (!uri) return "[contenido no encontrado]"
    return <Link
        href={contentUrl(uri)}
        className={"font-semibold hover:underline"}
        onClick={(e) => {
            e.stopPropagation()
        }}
    >
        {collectionToDisplay(getCollectionFromUri(uri), article, topicId)}
    </Link>
}


export const NotificationCard = ({notification}: { notification: ArCabildoabiertoNotificationListNotifications.Notification }) => {
    if (notification.reason == "follow") {
        return <UserNotificationCard
            notification={notification}
            reasonIcon={<UserPlusIcon size={24}/>}
            href={profileUrl(getDidFromUri(notification.uri))}
        >
            <Username user={notification.author}/> <span>
                te siguió.
            </span>
        </UserNotificationCard>
    } else if (notification.reason == "like") {
        return <UserNotificationCard
            notification={notification}
            reasonIcon={<HeartIcon size={24}/>}
            href={contentUrl(notification.reasonSubject)}
        >
            A <Username user={notification.author}/> le gustó <ContentMention uri={notification.reasonSubject}
                                                                              article={"author"}/>.
        </UserNotificationCard>
    } else if (notification.reason == "quote") {
        return <UserNotificationCard
            notification={notification}
            reasonIcon={<QuotesIcon size={24}/>}
            href={contentUrl(notification.uri)}
        >
            <Username user={notification.author}/> citó <ContentMention uri={notification.reasonSubject}
                                                                        article={"author"}/>.
        </UserNotificationCard>
    } else if (notification.reason == "repost") {
        return <UserNotificationCard
            notification={notification}
            reasonIcon={<RepostIcon fontSize={24} color={"text"}/>}
            href={contentUrl(notification.reasonSubject)}
        >
            <Username user={notification.author}/> republicó <ContentMention uri={notification.reasonSubject}
                                                                             article={"author"}/>.
        </UserNotificationCard>
    } else if (notification.reason == "reply") {
        return <UserNotificationCard
            notification={notification}
            reasonIcon={<ChatTextIcon size={24}/>}
            href={contentUrl(notification.reasonSubject ?? notification.uri)}
        >
            <Username user={notification.author}/> <Link
            className={"text-[var(--text-light)] hover:underline"}
            href={contentUrl(notification.uri)}
            onClick={(e) => {
                e.stopPropagation()
            }}
            >respondió</Link> a <ContentMention
                uri={notification.reasonSubject}
                article={"author"}
                topicId={notification.reasonSubjectContext}
            />.
        </UserNotificationCard>
    } else if (notification.reason == "mention") {
        return <UserNotificationCard
            notification={notification}
            reasonIcon={<AtIcon size={24}/>}
            href={contentUrl(notification.uri)}
        >
            <Username user={notification.author}/> te mencionó en <ContentMention
                uri={notification.uri}
                article={"not-author"}
            />.
        </UserNotificationCard>
    } else if (notification.reason == "topic-edit") {
        const topicId = notification.reasonSubject
        return <UserNotificationCard
            notification={notification}
            reasonIcon={<TopicsIcon outlined={false} fontSize={24}/>}
            href={topicUrl(topicId)}
        >
            <Username user={notification.author}/> editó el tema <Link className="font-semibold hover:underline"
                                                                       href={topicUrl(topicId)}>{topicId}</Link>, que
            vos también edistaste.
        </UserNotificationCard>
    } else if (notification.reason == "topic-version-vote") {
        const topicId = notification.reasonSubject
        const accept = getCollectionFromUri(notification.uri) == "ar.cabildoabierto.wiki.voteAccept"
        return <UserNotificationCard
            notification={notification}
            reasonIcon={accept ? <CheckIcon fontSize={24}/> : <XIcon fontSize={24}/>}
            href={topicUrl(topicId)}
        >
            <Username user={notification.author}/> {accept ? "validó" : "rechazó"} tu edición del tema <Link
                className="font-semibold hover:underline"
                href={topicUrl(topicId)}
        >
                {topicId}
            </Link>.
        </UserNotificationCard>
    } else {
        return null
    }
}