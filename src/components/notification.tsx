import { NotificationProps } from "../app/lib/definitions"
import { DateSince } from "./date"
import { CommentNotification, FollowNotification, ReactionNotification } from "./notification-components"



export const NotificationComponent = async ({notification}: {notification: NotificationProps}) => {
    let content = null
    if(notification.type == "Comment"){
        content = <CommentNotification notification={notification}/>
    } else if(notification.type == "Reaction"){
        content = <ReactionNotification notification={notification}/>
    } else if(notification.type == "Follow"){
        content = <FollowNotification notification={notification}/>
    }

    const className = "content-container flex flex-col space-y-2 p-2 " + (notification.viewed ? "" : "bg-[var(--secondary-light)]")

    return <div className={className}>
        <div className="text-[var(--text-light)]"><DateSince date={notification.createdAt}/></div>
        <div className="link">{content}</div>
    </div>
}