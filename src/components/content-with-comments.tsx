"use client"
import CommentSection from "./comment-section"
import ContentComponent from "./content"
import { useState } from "react"
import { createComment } from "src/actions/actions"
import dynamic from "next/dynamic"
import { useUser } from "src/app/hooks/user"
import useSWR, { useSWRConfig } from "swr"
import { fetcher } from "src/app/hooks/utils"


const CommentEditor = dynamic( () => import( 'src/components/editor/comment-editor' ), { ssr: false } );


type ContentWithCommentsProps = {
    contentId: string,
    entity?: any,
    isPostPage?: boolean
}


export const ContentWithComments: React.FC<ContentWithCommentsProps> = ({
    contentId, entity=null, isPostPage=false}) => {
    
    const { mutate } = useSWR("/api/comments/"+contentId, fetcher)

    const user = useUser()
    const startsOpen = isPostPage || entity
    const [viewComments, setViewComments] = useState(startsOpen) 
    const [writingReply, setWritingReply] = useState(startsOpen)
    

    const handleNewComment = async (text: string) => {
        if(user.user){
            await createComment(text, contentId, user.user.id)
            mutate()
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
            {writingReply && <div className="py-1">
                {startsOpen ? <CommentEditor onSubmit={handleNewComment}/> : 
                    <CommentEditor onSubmit={handleNewComment} onCancel={handleCancelComment}/>
                }
            </div>}
            {viewComments && <div>
                <CommentSection parentContentId={contentId} otherContents={entity ? entity.referencedBy : undefined}/>
            </div>}
        </div>
    </>
}