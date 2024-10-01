"use client"

import { useContent } from "../app/hooks/contents"
import { ContentProps, EntityProps } from "../app/lib/definitions"
import { decompress } from "./compression"
import { Authorship, CommentCounter, UserIdLink } from "./content"
import { ContentWithComments, ContentWithCommentsFromId } from "./content-with-comments"
import LoadingSpinner from "./loading-spinner"



export const UndoDiscussion = ({content, entity, version}: {content: ContentProps, entity: EntityProps, version: number}) => {

    return <ContentWithCommentsFromId
        contentId={entity.versions[version].undos[0].id}
    />
}


export const UndoDiscussionContent = ({content, onStartReply, onViewComments, viewingComments}: {content: ContentProps, onStartReply: () => void, onViewComments: () => void, viewingComments: boolean}) => {
    const undone = useContent(content.contentUndoneId)

    if(undone.isLoading){
        return <LoadingSpinner/>
    }

    return <div className="p-2">
        <h3>Esta versión fue deshecha</h3>
        <div>
            Fue escrita por <UserIdLink id={content.author.id}/> y deshecha por <UserIdLink id={content.author.id}/>.
        </div>
        <div className="">
            Calificada como vandalismo: {content.reportsVandalism ? "sí" : "no"}.
        </div>
        <div className="">
            Calificada como oportunismo: {content.reportsVandalism ? "sí" : "no"}.
        </div>
        <div>
            Motivo:
        </div>
        <div className="content">
        <blockquote>
            {decompress(content.compressedText)}
        </blockquote>
        <div className="flex justify-between">
        <button className="reply-btn" onClick={onStartReply}>
            Responder
        </button>
        <CommentCounter
            content={content}
            viewingComments={viewingComments}
            onViewComments={onViewComments}/>
        </div>
        </div>
    </div>
}