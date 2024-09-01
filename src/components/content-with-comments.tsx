"use client"
import CommentSection from "./comment-section"
import ContentComponent from "./content"
import { useState } from "react"
import { createComment } from "src/actions/actions"
import dynamic from "next/dynamic"
import { useUser } from "src/app/hooks/user"
import { useSWRConfig } from "swr"
import { EntityProps } from "src/app/lib/definitions"
import { useContent } from "src/app/hooks/contents"


const CommentEditor = dynamic( () => import( 'src/components/editor/comment-editor' ), { ssr: false } );


type ContentWithCommentsProps = {
    contentId: string,
    entity?: EntityProps,
    isPostPage?: boolean
}


export const ContentWithComments: React.FC<ContentWithCommentsProps> = ({
    contentId, entity, isPostPage=false}) => {
    
    const {mutate} = useSWRConfig()
    const content = useContent(contentId)

    const user = useUser()
    const isEntity = entity !== undefined
    const startsOpen = isPostPage || isEntity
    const [viewComments, setViewComments] = useState(startsOpen) 
    const [writingReply, setWritingReply] = useState(startsOpen)
    

    const handleNewComment = async (text: string) => {
        if(user.user){
            await createComment(text, contentId, user.user.id)
            mutate("/api/comments/"+contentId)
            if(entity)
                mutate("/api/entity-comments/"+entity.id)
            setViewComments(true)

            // para que se resetee el contenido del editor
            setWritingReply(false)
            setWritingReply(startsOpen)
        }
    }

    const handleCancelComment = () => {
        setWritingReply(false)
    }

    const isMainPage = isPostPage || entity

    return <>
        <ContentComponent
            contentId={contentId}
            onViewComments={() => {setViewComments(!viewComments)}}
            entity={entity}
            isPostPage={isPostPage}
            viewingComments={viewComments}
            onStartReply={() => {setWritingReply(!writingReply)}}
        />
        {isMainPage && <hr className="mt-12"/>}
        <div className={isMainPage ? "" : "ml-2"}>
            {writingReply && <div className="py-2">
                {startsOpen ? <CommentEditor onSubmit={handleNewComment}/> : 
                    <CommentEditor onSubmit={handleNewComment} onCancel={handleCancelComment}/>
                }
            </div>}
            {viewComments && content.content && <div className="mt-2">
                <CommentSection
                    content={content.content}
                    otherContents={entity ? entity.referencedBy : undefined}
                />
            </div>}
        </div>
    </>
}