"use client"
import { useContent, useRootContent } from 'src/app/hooks/contents';
import { CommentProps, Comment } from './comment';
import Link from 'next/link';
import LoadingSpinner from './loading-spinner';
import { PostTitleOnFeed } from './post-on-feed';
import { ContentProps } from 'src/app/lib/definitions';



export function shortDescription(content: ContentProps){
    const parentAuthor = content.author.id
    const authorUrl = "/perfil/"+parentAuthor
    const parentUrl = (content.type == "EntityContent" ? "/articulo/" : "/contenido/") + content.id
    const parentEntityId = content.parentEntityId
    const parentEntityName = decodeURIComponent(parentEntityId).replace("_", " ")

    let desc = null
    if(content.type == "Comment"){
        desc = <>un <Link href={parentUrl}>comentario</Link> de <Link href={authorUrl}>@{parentAuthor}</Link>.</>
    } else if(content.type == "Post"){
        desc = <><Link href={parentUrl}><span className="font-bold content">{'"'+content.title+'"'}</span></Link>, publicación de <Link href={authorUrl}>@{parentAuthor}</Link>.</>
    } else if(content.type == "FastPost"){
        desc = <>una <Link href={parentUrl}>publicación rápida</Link> de <Link href={authorUrl}>@{parentAuthor}</Link>.</>
    } else if(content.type == "EntityContent"){
        desc = <><Link href={parentUrl}><span className="font-bold content">{parentEntityName}</span></Link> (artículo público).</>
    } else if(content.type == "FakeNewsReport"){
        desc = <><Link href={parentUrl}>reporte de noticia falsa</Link> de <Link href={authorUrl}>@{parentAuthor}</Link>.</>
    }
    return desc
}


export const CommentInContext = ({
    content,
    onViewComments,
    viewingComments,
    onStartReply,
    isFakeNewsReport,
    inCommentSection=false}: CommentProps) => {
    if(!content.parentContents[0]){
        console.log("content with error is", content)
        return <>Error :(</>
    }
    const parentId = content.parentContents[0].id
    const parentContent = useContent(parentId)
    const rootContent = useRootContent(content.id)
    if(parentContent.isLoading || rootContent.isLoading){
        return <LoadingSpinner/>
    }

    const comment = <Comment
        content={content}
        onViewComments={onViewComments}
        viewingComments={viewingComments}
        onStartReply={onStartReply}
        inCommentSection={inCommentSection}
        isFakeNewsReport={isFakeNewsReport}
    />

    let replyTo = <>En respuesta a {shortDescription(parentContent.content)}</>
    let rootIs = parentContent.content.id != rootContent.content.id ? <>La discusión empezó en {shortDescription(rootContent.content)}</> : <></>

    if(!inCommentSection){
        return <div>
            <div className=" ml-1 link text-[var(--text-light)]">{replyTo} {rootIs}</div>
            {comment}
        </div>
    } else {
        return <>{comment}</>
    }
}