import {Notification as BskyNotification} from "@/lex-api/types/app/bsky/notification/listNotifications"
import {Notification as CANotification} from "@/lex-api/types/ar/cabildoabierto/notification/listNotifications"
import {getUsername} from "@/utils/utils";
import {ProfileView} from "@/lex-api/types/app/bsky/actor/defs";
import UserSummaryOnHover from "@/components/profile/user-summary";
import {DateSince} from "../../../modules/ui-utils/src/date";
import {ProfilePic} from "@/components/profile/profile-pic";
import {AtIcon, CheckIcon, UserPlusIcon, XIcon} from "@phosphor-icons/react";
import {HeartIcon} from "@phosphor-icons/react";
import {QuotesIcon} from "@phosphor-icons/react";
import {RepeatIcon, ChatTextIcon} from "@phosphor-icons/react";
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
import TopicsIcon from "@/components/icons/topics-icon";

const Username = ({user}: { user: ProfileView }) => {
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
    notification: CANotification, children: ReactNode, reasonIcon: ReactNode, href?: string
}) => {
    return <NotificationCardFrame
        read={notification.isRead}
        reasonIcon={reasonIcon}
        href={href}
    >
        <div className={"flex flex-col justify-between w-full sm:text-base text-sm"}>
            <div className={"flex-1"}/>

            <div className={"flex space-x-2 items-center w-full"}>
                <ProfilePic user={notification.author} className={"rounded-full h-6 w-6"}/>

                <div className={"max-w-[70%]"}>
                    {children}
                </div>
            </div>

            <div className={"w-full flex justify-end space-x-1 text-sm flex-1"}>
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


const ContentMention = ({uri, article}: { uri: string, article: ArticleKind }) => {
    if (!uri) return "[contenido no encontrado]"
    return <Link
        href={contentUrl(uri)}
        className={"lowercase font-semibold hover:underline"}
        onClick={(e) => {
            e.stopPropagation()
        }}
    >
        {collectionToDisplay(getCollectionFromUri(uri), article)}
    </Link>
}


export const NotificationCard = ({notification}: { notification: CANotification }) => {
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
            reasonIcon={<RepeatIcon size={24}/>}
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
        >respondió</Link> a <ContentMention uri={notification.reasonSubject} article={"author"}/>.
        </UserNotificationCard>
    } else if (notification.reason == "mention") {
        return <UserNotificationCard
            notification={notification}
            reasonIcon={<AtIcon size={24}/>}
            href={notification.uri}
        >
            <Username user={notification.author}/> te mencionó en <ContentMention uri={notification.uri}
                                                                                  article={"not-author"}/>.
        </UserNotificationCard>
    } else if (notification.reason == "topic-edit") {
        const topicId = notification.reasonSubject
        return <UserNotificationCard
            notification={notification}
            reasonIcon={<TopicsIcon outlined={false} fontSize={24}/>}
            href={notification.uri}
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
            href={notification.uri}
        >
            <Username user={notification.author}/> {accept ? "validó" : "rechazó"} tu edición del tema <Link
                className="font-semibold hover:underline"
                href={topicUrl(topicId)}>
                {topicId}
            </Link>.
        </UserNotificationCard>
    } else {
        return <div className={"p-2 text-center text-[var(--text-light)]"}>
            Notificación desconocida
        </div>
    }
}