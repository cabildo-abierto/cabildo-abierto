import {Notification as BskyNotification} from "@/lex-api/types/app/bsky/notification/listNotifications"
import {getUsername} from "@/utils/utils";
import {ProfileView} from "@/lex-api/types/app/bsky/actor/defs";
import UserSummaryOnHover from "@/components/profile/user-summary";
import {DateSince} from "../../../modules/ui-utils/src/date";
import {ProfilePic} from "@/components/profile/profile-pic";
import {AtIcon, UserPlusIcon} from "@phosphor-icons/react";
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
    profileUrl
} from "@/utils/uri";
import Link from "next/link";
import {useRouter} from "next/navigation";

const Username = ({user}: { user: ProfileView }) => {
    return <UserSummaryOnHover handle={user.handle}>
        <div className={"font-bold hover:underline truncate max-w-[300px]"}>
            {getUsername(user)}
        </div>
    </UserSummaryOnHover>
}


const NotificationCardFrame = ({read, reasonIcon, children, href}: {
    read: boolean,
    reasonIcon: ReactNode,
    children: ReactNode,
    href?: string
}) => {
    const router = useRouter()
    return <div
        className={"border-b h-24 px-4 flex space-x-4 py-2 cursor-pointer hover:bg-[var(--background-dark)] " + (!read ? "bg-[var(--background-dark)]" : "")}
        onClick={() => {
            if(href) router.push(href)
        }}
    >
        <div className={"flex items-center"}>
            {reasonIcon}
        </div>

        {children}
    </div>
}


const UserNotificationCard = ({notification, children, reasonIcon, href}: {
    notification: BskyNotification, children: ReactNode, reasonIcon: ReactNode, href?: string
}) => {
    return <NotificationCardFrame
        read={notification.isRead}
        reasonIcon={reasonIcon}
        href={href}
    >
        <div className={"flex flex-col justify-between w-full"}>
            <div className={"flex-1"}/>

            <div className={"flex space-x-2 items-center"}>
                <ProfilePic user={notification.author} className={"rounded-full h-6 w-6"}/>
                {children}
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
        className={"lowercase text-[var(--text-light)] hover:underline"}
        onClick={(e) => {
            e.stopPropagation()
        }}
    >
        {collectionToDisplay(getCollectionFromUri(uri), article)}
    </Link>
}


export const NotificationCard = ({notification}: { notification: BskyNotification }) => {
    if (notification.reason == "follow") {
        return <UserNotificationCard
            notification={notification}
            reasonIcon={<UserPlusIcon size={24}/>}
            href={profileUrl(getDidFromUri(notification.uri))}
        >
            <div className={"flex space-x-1"}>
                <Username user={notification.author}/>
                <div>
                    te siguió.
                </div>
            </div>
        </UserNotificationCard>
    } else if (notification.reason == "like") {
        return <UserNotificationCard
            notification={notification}
            reasonIcon={<HeartIcon size={24}/>}
            href={contentUrl(notification.reasonSubject)}
        >
            <div className={"flex space-x-1"}>
                <div>
                    A
                </div>
                <Username user={notification.author}/>
                <div>
                    le gustó
                </div>
                <div className={"flex"}>
                    <ContentMention uri={notification.reasonSubject} article={"author"}/>
                    <div>
                        .
                    </div>
                </div>
            </div>
        </UserNotificationCard>
    } else if (notification.reason == "quote") {
        return <UserNotificationCard
            notification={notification}
            reasonIcon={<QuotesIcon size={24}/>}
            href={contentUrl(notification.uri)}
        >
            <div className={"flex space-x-1"}>
                <Username user={notification.author}/>
                <div>
                    citó
                </div>
                <div className={"flex"}>
                    <ContentMention uri={notification.reasonSubject} article={"author"}/>
                    <div>
                        .
                    </div>
                </div>
            </div>
        </UserNotificationCard>
    } else if (notification.reason == "repost") {
        return <UserNotificationCard
            notification={notification}
            reasonIcon={<RepeatIcon size={24}/>}
            href={contentUrl(notification.reasonSubject)}
        >
            <div className={"flex space-x-1"}>
                <Username user={notification.author}/>
                <div>
                    republicó
                </div>
                <div className={"flex"}>
                    <ContentMention uri={notification.reasonSubject} article={"author"}/>
                    <div>
                        .
                    </div>
                </div>
            </div>
        </UserNotificationCard>
    } else if (notification.reason == "reply") {
        return <UserNotificationCard
            notification={notification}
            reasonIcon={<ChatTextIcon size={24}/>}
            href={notification.uri}
        >
            <div className={"flex space-x-1"}>
                <Username user={notification.author}/>
                <Link
                    className={"text-[var(--text-light)] hover:underline"}
                    href={contentUrl(notification.uri)}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                >
                    respondió
                </Link>
                <div>
                    a
                </div>
                <div className={"flex"}>
                    <ContentMention uri={notification.reasonSubject} article={"author"}/>
                    <div>
                        .
                    </div>
                </div>
            </div>
        </UserNotificationCard>
    } else if (notification.reason == "mention") {
        return <UserNotificationCard
            notification={notification}
            reasonIcon={<AtIcon size={24}/>}
            href={notification.uri}
        >
            <div className={"flex space-x-1"}>
                <Username user={notification.author}/>
                <div>
                    te mencionó en
                </div>
                <div className={"flex"}>
                    <ContentMention uri={notification.uri} article={"not-author"}/>
                    <div>
                        .
                    </div>
                </div>
            </div>
        </UserNotificationCard>
    }

    return null
}