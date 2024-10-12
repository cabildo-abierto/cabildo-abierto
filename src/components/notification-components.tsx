"use client"
import Link from "next/link"
import { ContentProps, ContributionsProps, NotificationProps } from "../app/lib/definitions"
import { useContent } from "../app/hooks/contents"
import LoadingSpinner from "./loading-spinner"
import { useUser } from "../app/hooks/user"
import { articleUrl, contentUrl } from "./utils"


const UserMention = ({id}: {id: string}) => {
    return <Link href={"/perfil/"+id}>@{id}</Link>
}


const EditDescriptionInNotification = ({content}: {content: ContentProps}) => {
    const href = articleUrl(content.parentEntityId)
    const {user} = useUser()

    const c: ContributionsProps = JSON.parse(content.contribution)

    if(user && c.some(([a, n]) => (a == user.id))){
        return <>
            el <Link href={href}>artículo público</Link> que editaste.
        </>
    }

    return <>
        el <Link href={href}>artículo público</Link>.
    </>
}


function PostDescription({contentId}: {contentId: string}){
    const {content, isLoading} = useContent(contentId)
    const {user} = useUser()
    if(isLoading) return null

    if(!content){
        return <></>
    }

    let post = null
    if(content.type == "EntityContent"){
        post = <EditDescriptionInNotification content={content}/>
    } else {
        const href = contentUrl(contentId)
        const isAuthor = user && content.author.id == user.id
        if(content.type == "Comment"){
            post = <>{isAuthor ? "tu" : "un"} <Link href={href}>comentario</Link>.</>
        } else if(content.type == "Post" || content.type == "FastPost"){
            post = <>{isAuthor ? "tu" : "la"} <Link href={href}>publicación</Link>.</>
        } else if(content.type == "FakeNewsReport"){
            post = <>{isAuthor ? "tu" : "un"} <Link href={href}>reporte de noticia falsa</Link>.</>
        }
    }
    return post
}


export const CommentNotification = ({notification}: {notification: NotificationProps}) => {
    const content = useContent(notification.contentId)
    if(content.isLoading){
        return <LoadingSpinner/>
    }

    if(!content.content){
        return <>Error con {notification.contentId}</>
    }
    
    if(!content.content.parentContents[0].id){
        return null
    }

    const post = <PostDescription
        contentId={content.content.parentContents[0].id}
    />

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


export const MentionNotification = ({notification}: {notification: NotificationProps}) => {
    const post = <PostDescription
        contentId={notification.contentId}
    />

    if(!post) return <LoadingSpinner/>

    return <><UserMention id={notification.userById}/> te mencionó en {post}</>
}