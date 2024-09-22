"use client"
import Link from "next/link"
import { ContentProps, NotificationProps } from "../app/lib/definitions"
import { DateSince } from "./date"
import { follow } from "../actions/users"
import { useContent } from "../app/hooks/contents"
import LoadingSpinner from "./loading-spinner"


const UserMention = ({id}: {id: string}) => {
    return <Link href={"/perfil/"+id}>@{id}</Link>
}


function PostDescription({contentId}: {contentId: string}){
    const {content, isLoading} = useContent(contentId)
    if(isLoading) return null

    let post = null
    const href = "/contenido/"+contentId

    if(content.type == "EntityContent"){
        post = <>el <Link href={href}>artículo público</Link> que editaste.</>
    } else if(content.type == "Comment"){
        post = <>tu <Link href={href}>comentario</Link>.</>
    } else if(content.type == "Post" || content.type == "FastPost"){
        post = <>tu <Link href={href}>publicación</Link>.</>
    } else if(content.type == "FakeNewsReport"){
        post = <>tu <Link href={href}>reporte de noticia falsa</Link>.</>
    }
    return post
}

export const CommentNotification = ({notification}: {notification: NotificationProps}) => {
    const content = useContent(notification.contentId)
    if(content.isLoading){
        return <LoadingSpinner/>
    }
    
    const post = <PostDescription contentId={content.content.parentContents[0].id}/>
    if(!post) return <LoadingSpinner/>

    return <><UserMention id={notification.userById}/> comentó {post}</>
}

export const ReactionNotification = ({notification}: {notification: NotificationProps}) => {
    const post = <PostDescription contentId={notification.contentId}/>

    return <>A <UserMention id={notification.userById}/> le gustó {post}</>
}

export const FollowNotification = ({notification}: {notification: NotificationProps}) => {
    // TO DO: Agregar botón de seguir también
    //const followAswell = async () => {
    //    await follow(notification.userById, notification.userNotifiedId)
    //}
    // <button className="hover:text-[var(--primary)]" onClick={followAswell}>Seguir también</button>
    
    return <>
        <UserMention id={notification.userById}/> empezó a seguirte.
    </>
}