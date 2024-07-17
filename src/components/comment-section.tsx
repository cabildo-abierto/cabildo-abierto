"use client"

import { ContentWithComments } from "@/components/content-with-comments"

const CommentSection = ({parentContent, comments}) => {

    return <>
        {comments.map((comment) => (
            <div className="py-1" key={comment.content.id}>
                <ContentWithComments content={comment.content} comments={comment.children}/>
            </div>
        ))}
    </>
}

export default CommentSection