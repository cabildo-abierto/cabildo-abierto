"use client"
import { useEffect } from "react"
import { useUser } from "../app/hooks/user"
import { NotificationProps } from "../app/lib/definitions"
import { DateSince } from "./date"
import { CommentNotification, FollowNotification, MentionNotification, ReactionNotification } from "./notification-components"
import { markNotificationViewed } from "../actions/contents"
import { useSWRConfig } from "swr"



export const NotificationComponent = ({notification}: {notification: NotificationProps}) => {
    const user = useUser()
    const {mutate} = useSWRConfig()

    useEffect(() => {
        if(!notification.viewed){
            markNotificationViewed(notification.id)
            mutate("/api/user")
        }
    }, [])
    
    let content = null
    if(notification.type == "Comment"){
        content = <CommentNotification notification={notification}/>
    } else if(notification.type == "Reaction"){
        content = <ReactionNotification notification={notification}/>
    } else if(notification.type == "Follow"){
        content = <FollowNotification notification={notification}/>
    } else if(notification.type == "Mention"){
        content = <MentionNotification notification={notification}/>
    }

    const className = "content-container flex flex-col space-y-2 p-2 " + (notification.viewed ? "" : "bg-[var(--secondary-light)]")

    return <div className={className}>
        <div className="text-[var(--text-light)]"><DateSince date={notification.createdAt}/></div>
        <div className="link">{content}</div>
    </div>
}