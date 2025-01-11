"use client"

import { TopicProps } from "../app/lib/definitions"


export const UndoDiscussion = ({entity, version}: {entity: TopicProps, version: number}) => {
    return <>TO DO</>
    /*return <ContentWithCommentsFromId
        contentId={entity.versions[version].undos[0].id}
    />*/
}


export const UndoDiscussionContent = ({content, onStartReply, onViewComments, viewingComments}: {
    content: {
        contentUndoneId: string
        author: {did: string}
        compressedText?: string
        reportsVandalism: boolean
        reportsOportunism: boolean
        _count: {
            childrenTree: number
        }
    }
    onStartReply: () => void
    onViewComments: () => void
    viewingComments: boolean
}) => {
    return <div>
        Sin implementar
    </div>
    /*const undone = useContent(content.contentUndoneId)

    if(undone.isLoading){
        return <LoadingSpinner/>
    }

    return <div className="px-2 pt-2">
        <h3>Versión deshecha</h3>
        <div>
            Escrita por <UserIdLink id={content.author.did}/>. Deshecha por <UserIdLink id={content.author.did}/>.
        </div>
        <div className="flex">
            <div className="content w-full">
                <blockquote>
                    {decompress(content.compressedText)}
                </blockquote>

                </div>
            <div className="text-gray-600 text-center text-[0.85rem] w-32">
                <div className="flex flex-col">
                    <span className="">¿Es vandalismo?</span> {content.reportsVandalism ? "sí" : "no"}
                </div>
                <div className="flex flex-col">
                    <span className="">¿Es oportunismo?</span> {content.reportsVandalism ? "sí" : "no"}
                </div>
            </div>
        </div>
        <div className="flex justify-between mb-1 mt-1">
            <button className="reply-btn" onClick={onStartReply}>
                Responder
            </button>
            <CommentCounter
                content={content}
                viewingComments={viewingComments}
                onViewComments={onViewComments}
            />
        </div>
    </div>*/
}