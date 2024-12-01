"use client"
import { useEffect, useState } from "react"
import { NotificationProps } from "../../app/lib/definitions"
import { DateSince } from "../date"
import { markNotificationViewed } from "../../actions/contents"
import { useSWRConfig } from "swr"
import { CustomLink as Link } from '../custom-link';



export const NotificationComponent = ({notification}: {notification: NotificationProps}) => {
    const {mutate} = useSWRConfig()
    const [viewed, setViewed] = useState(notification.viewed)

    useEffect(() => {
        return () => {
            if(!notification.viewed){
                markNotificationViewed(notification.id)
                mutate("/api/user")
                mutate("/api/notifications")
            }
        };
    }, [notification])
    
    let content = null

    const className = "content-container rounded flex flex-col space-y-2 p-2 " + (viewed ? "" : "bg-[var(--secondary-light)]")

    return <div className={className}>
        <div className="text-[var(--text-light)]"><DateSince date={notification.createdAt}/></div>
        <div className="link">{content}</div>
    </div>
}