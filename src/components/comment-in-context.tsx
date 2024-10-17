"use client"
import { Comment, CommentComponentProps } from './comment';
import Link from 'next/link';
import LoadingSpinner from './loading-spinner';
import { useContent } from '../app/hooks/contents';
import { ContentProps } from '../app/lib/definitions';
import { articleUrl, contentUrl } from './utils';



export function shortDescription(content: ContentProps){
    const parentAuthor = content.author.id
    const authorUrl = "/perfil/"+parentAuthor
    const parentEntityId = content.parentEntityId
    const parentUrl = content.type == "EntityContent" ? articleUrl(parentEntityId) : contentUrl(content.id)
    
    const parentEntityName = decodeURIComponent(parentEntityId).replaceAll("_", " ")

    let desc = null
    if(content.type == "Comment"){
        desc = <>un <Link href={parentUrl}>comentario</Link> de <Link href={authorUrl}>@{parentAuthor}</Link>.</>
    } else if(content.type == "Post"){
        desc = <><Link href={parentUrl}><span className="">{content.title}</span></Link>, publicación de <Link href={authorUrl}>@{parentAuthor}</Link>.</>
    } else if(content.type == "FastPost"){
        desc = <>una <Link href={parentUrl}>publicación rápida</Link> de <Link href={authorUrl}>@{parentAuthor}</Link>.</>
    } else if(content.type == "EntityContent"){
        desc = <><Link href={parentUrl}><span className="">{parentEntityName}</span></Link> (tema).</>
    } else if(content.type == "FakeNewsReport"){
        desc = <>un <Link href={parentUrl}>reporte de noticia falsa</Link> de <Link href={authorUrl}>@{parentAuthor}</Link>.</>
    }
    return desc
}


export const contentContextClassName = "bg-[var(--secondary-light)] px-2 text-sm mx-1 mt-1 link text-[var(--text-light)]"


export const CommentInContext = ({
    content,
    onViewComments,
    viewingComments,
    onStartReply,
    isFakeNewsReport,
    inCommentSection=false,
    inItsOwnCommentSection,
    depthParity=false}: CommentComponentProps) => {
    const parentId = content.parentContents[0].id
    const parentContent = useContent(parentId)
    const rootContent = useContent(content.rootContentId)

    if(parentContent.isLoading || rootContent.isLoading){
        return <LoadingSpinner/>
    }

    const comment = <Comment
        content={content}
        onViewComments={onViewComments}
        viewingComments={viewingComments}
        onStartReply={onStartReply}
        inCommentSection={inCommentSection}
        inItsOwnCommentSection={inItsOwnCommentSection}
        isFakeNewsReport={isFakeNewsReport}
    />

    let replyTo = <>En respuesta a {shortDescription(parentContent.content)}</>
    let rootIs = parentContent.content.id != rootContent.content.id ? <>La discusión empezó en {shortDescription(rootContent.content)}</> : <></>

    if(!inItsOwnCommentSection){
        return <div>
            <div className={contentContextClassName}>
                {replyTo} {rootIs}
            </div>
            {comment}
        </div>
    } else {
        return <>{comment}</>
    }
}