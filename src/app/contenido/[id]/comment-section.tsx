"use client"

import { ContentProps, getContentComments } from "@/actions/get-content"
import ContentComponent from "@/components/content"
import { NewComment } from "@/components/new-comment"
import { useState } from "react"


const CommentSection = ({parentContent, comments}) => {
    const [updatedComments, setUpdatedComments] = useState(comments)

    const handleNewComment = (comment) => {
        setUpdatedComments([comment, ...updatedComments])
    }

    return <div className="border-t">
        <div className="">
            <NewComment content={parentContent} onNewComment={handleNewComment}/>
        </div>
        {updatedComments.map((content) => (
            <div className="py-1" key={content.id}>
                <ContentComponent content={content} isMainContent={false}/>
            </div>
        ))}
    </div>
}

export default CommentSection