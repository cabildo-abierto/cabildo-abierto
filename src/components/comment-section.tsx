"use client"

import { ContentWithComments } from "@/components/content-with-comments"

const CommentSection = ({parentContent, comments}) => {

    return <div className="">
        {comments.map((comment) => (
            <div className="py-1" key={comment.content.id}>
                <ContentWithComments content={comment.content} comments={comment.children}/>
            </div>
        ))}
    </div>
}

export default CommentSection