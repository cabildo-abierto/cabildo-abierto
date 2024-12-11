"use client"
import { useEffect, useState } from "react"
import { DateSince } from "../date"
import { useSWRConfig } from "swr"



export const NotificationComponent = ({notification}: {notification: any}) => {
    const {mutate} = useSWRConfig()
    const [viewed, setViewed] = useState(notification.viewed)

    /*useEffect(() => {
        return () => {
            if(!notification.viewed){
                markNotificationViewed(notification.id)
                mutate("/api/user")
                mutate("/api/notifications")
            }
        };
    }, [notification])*/
    
    let content = null

    const className = "content-container rounded flex flex-col space-y-2 p-2 " + (viewed ? "" : "bg-[var(--secondary-light)]")

    return <div className={className}>
        <div className="text-[var(--text-light)]"><DateSince date={notification.createdAt}/></div>
        <div className="link">{content}</div>
    </div>
}