"use client"
import { useEffect } from "react"
import { useUser } from "../app/hooks/user"
import { NotificationProps } from "../app/lib/definitions"
import { DateSince } from "./date"
import { CommentNotification, FollowNotification, MentionNotification, ReactionNotification } from "./notification-components"
import { markNotificationViewed } from "../actions/contents"
import { useSWRConfig } from "swr"
import Link from "next/link"



export const NotificationComponent = ({notification}: {notification: NotificationProps}) => {
    const {mutate} = useSWRConfig()

    useEffect(() => {
        if(!notification.viewed){
            markNotificationViewed(notification.id)
            mutate("/api/user")
        }
    }, [])
    
    let content = null
    if(notification.type == "Comment" || notification.type == "CommentToComment"){
        content = <CommentNotification notification={notification}/>
    } else if(notification.type == "Reaction"){
        content = <ReactionNotification notification={notification}/>
    } else if(notification.type == "Follow"){
        content = <FollowNotification notification={notification}/>
    } else if(notification.type == "Mention" || notification.type == "EditMention"){
        content = <MentionNotification notification={notification}/>
    } else {
        content = <>Error n01. Si podés, avisale al <Link href="/soporte">soporte</Link>.</>
    }

    const className = "content-container rounded flex flex-col space-y-2 p-2 " + (notification.viewed ? "" : "bg-[var(--secondary-light)]")

    return <div className={className}>
        <div className="text-[var(--text-light)]"><DateSince date={notification.createdAt}/></div>
        <div className="link">{content}</div>
    </div>
}