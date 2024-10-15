"use client"
import Link from "next/link"
import { ContributionsProps, NotificationProps } from "../app/lib/definitions"
import LoadingSpinner from "./loading-spinner"
import { useUser } from "../app/hooks/user"
import { articleUrl, contentUrl } from "./utils"


const UserMention = ({id}: {id: string}) => {
    return <Link href={"/perfil/"+id}>@{id}</Link>
}


const EditDescriptionInNotification = ({content}: {content: {parentEntityId: string, contribution: string}}) => {
    const href = articleUrl(content.parentEntityId)
    const {user} = useUser()

    const c: ContributionsProps = JSON.parse(content.contribution)

    if(user && c.some(([a, n]) => (a == user.id))){
        return <>
            el <Link href={href}>artículo público</Link> que editaste
        </>
    }

    return <>
        el <Link href={href}>artículo público</Link>
    </>
}


function PostDescription({content}: {content: {id: string, authorId: string, type: string, contribution: string, parentEntityId: string}}){
    const {user} = useUser()

    let post = null
    if(content.type == "EntityContent"){
        post = <EditDescriptionInNotification content={content}/>
    } else {
        const href = contentUrl(content.id)
        const isAuthor = user && content.authorId == user.id
        if(content.type == "Comment"){
            post = <>{isAuthor ? "tu" : "un"} <Link href={href}>comentario</Link></>
        } else if(content.type == "Post" || content.type == "FastPost"){
            post = <>{isAuthor ? "tu" : "la"} <Link href={href}>publicación</Link></>
        } else if(content.type == "FakeNewsReport"){
            post = <>{isAuthor ? "tu" : "un"} <Link href={href}>reporte de noticia falsa</Link></>
        }
    }
    return post
}


export const CommentNotification = ({notification}: {notification: NotificationProps}) => {

    const post = <PostDescription
        content={notification.content.parentContents[0]}
    />

    if(!post) return <LoadingSpinner/>

    return <><UserMention id={notification.userById}/> comentó {post}{notification.type == "CommentToComment" ? <> en una conversación en la que participaste.</> : <>.</>}</>
}

export const ReactionNotification = ({notification}: {notification: NotificationProps}) => {

    const post = <PostDescription content={notification.content}/>

    return <>A <UserMention id={notification.userById}/> le gustó {post}.</>
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


export const MentionNotification = ({notification}: {notification: NotificationProps}) => {
    const post = <PostDescription
        content={notification.content}
    />

    if(!post) return <LoadingSpinner/>

    return <><UserMention id={notification.userById}/> te mencionó en {post}.</>
}