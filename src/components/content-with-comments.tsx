"use client"
import CommentSection from "./comment-section"
import ContentComponent from "./content"
import { useState } from "react"
import { createComment } from "@/actions/create-content"
import dynamic from "next/dynamic"

const CommentEditor = dynamic( () => import( '@/components/editor/comment-editor' ), { ssr: false } );


export const ContentWithComments = ({content, comments, entity=null, isPostPage=false}) => {
    const startsOpen = (content.type == "Post" && isPostPage) || content.type == "EntityContent"
    const [viewComments, setViewComments] = useState(startsOpen) 
    const [writingReply, setWritingReply] = useState(startsOpen)
    const [updatedComments, setUpdatedComments] = useState(comments)

    const handleNewComment = async (comment) => {
        const newComment = await createComment(comment, content.id)
        setUpdatedComments([newComment, ...updatedComments])
        setWritingReply(false)
        setViewComments(true)
    }

    const handleCancelComment = () => {
        setWritingReply(false)
    }

    return <div>
        <ContentComponent
            content={content}
            comments={updatedComments}
            onViewComments={() => {setViewComments(!viewComments)}}
            onStartReply={() => {setWritingReply(!writingReply)}}
            entity={entity}
            isPostPage={isPostPage}
        />
        {isPostPage && <hr/>}
        <div className="">
            {writingReply && <div className="mt-1 mb-2 ml-2">
                {startsOpen ? <CommentEditor onSubmit={handleNewComment}/> : 
                    <CommentEditor onSubmit={handleNewComment} onCancel={handleCancelComment}/>
                }
            </div>}
            {viewComments && <div className="ml-2">
                <CommentSection parentContent={content} comments={updatedComments}/>
            </div>}
        </div>
    </div>
}