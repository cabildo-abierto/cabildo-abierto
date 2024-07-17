"use client"
import CommentSection from "./comment-section"
import ContentComponent from "./content"
import { useState } from "react"
import { createComment } from "@/actions/create-content"
import { Post } from "./post"
import CommentEditor from "./editor/comment-editor"


export const ContentWithComments = ({content, comments, isPost=false}) => {
    // en los posts la sección de comentarios siempre está abierta
    const [viewComments, setViewComments] = useState(isPost) 
    const [writingReply, setWritingReply] = useState(isPost)
    const [updatedComments, setUpdatedComments] = useState(comments)

    const handleNewComment = async (comment) => {
        const newComment = await createComment(comment, content.id)
        setUpdatedComments([newComment, ...updatedComments])
        setWritingReply(false)
    }

    const handleCancelComment = () => {
        setWritingReply(false)
    }

    return <div>
        {isPost ? <Post content={content}/>: <ContentComponent
            content={content}
            comments={updatedComments}
            onViewComments={() => {setViewComments(!viewComments)}}
            onStartReply={() => {setWritingReply(!writingReply)}}
        />}
        <div className="border-t">
            {writingReply && <div>
                <div className="mt-1 mb-2 ml-2">
                    {isPost ? <CommentEditor onSubmit={handleNewComment}/> : 
                        <CommentEditor onSubmit={handleNewComment} onCancel={handleCancelComment}/>
                    }
                </div>
            </div>}
            {viewComments && <div className="ml-2">
                <CommentSection parentContent={content} comments={updatedComments}/>
            </div>}
        </div>
    </div>
}