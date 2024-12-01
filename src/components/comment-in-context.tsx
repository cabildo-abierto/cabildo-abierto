"use client"
import { ContentType } from '@prisma/client';
import { Comment, CommentComponentProps } from './comment';
import { CustomLink as Link } from './custom-link';
import { articleUrl, contentUrl } from './utils';


export type ShortDescriptionProps = {
    author: {id: string}
    id: string
    type: ContentType
    parentEntityId?: string
    title?: string
    uri: string
}


export function shortDescription(content: ShortDescriptionProps){
    const parentAuthor = content.author.id
    const authorUrl = "/perfil/"+parentAuthor
    const parentEntityId = content.parentEntityId
    const parentUrl = content.type == "EntityContent" ? articleUrl(parentEntityId) : contentUrl(content.uri, content.id)
    
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


export const contentContextClassName = "bg-[var(--secondary-light)] px-2 text-sm mx-1 mt-1 link text-[var(--text-light)] rounded "


export const CommentInContext = ({
    content,
    onViewComments,
    viewingComments,
    onStartReply,
    isFakeNewsReport,
    inCommentSection=false,
    inItsOwnCommentSection,
    depth}: CommentComponentProps) => {

    const comment = <Comment
        content={content}
        onViewComments={onViewComments}
        viewingComments={viewingComments}
        onStartReply={onStartReply}
        inCommentSection={inCommentSection}
        inItsOwnCommentSection={inItsOwnCommentSection}
        isFakeNewsReport={isFakeNewsReport}
    />

    if(inItsOwnCommentSection){
        return comment
    }

    const parentContent = content.parentContents[0]
    const rootContent = content.rootContent

    let replyTo = <>En respuesta a {shortDescription(parentContent)}</>
    let rootIs = parentContent.id != rootContent.id ? <>La discusión empezó en {shortDescription(rootContent)}</> : <></>

    return <div>
        <div className={contentContextClassName}>
            {replyTo} {rootIs}
        </div>
        {comment}
    </div>
}