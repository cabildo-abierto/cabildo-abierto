"use client"
import CommentSection from "./comment-section"
import ContentComponent from "./content"
import { useState } from "react"
import { createComment } from "@/actions/create-content"
import CommentEditor from "./editor/comment-editor"
import useUser from "./use-user"


export const ContentWithComments = ({content, comments, entity=null}) => {
    const startsOpen = content.type == "Post" || content.type == "EntityContent"
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
        />
        <div className="border-t">
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