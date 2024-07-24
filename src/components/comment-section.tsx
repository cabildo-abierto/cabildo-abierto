"use client"

import { ContentProps } from "@/actions/get-content"
import { ContentWithComments } from "@/components/content-with-comments"

const CommentSection: React.FC<{comments: ContentProps[]}> = ({comments}) => {

    return <>
        {comments.map((comment: ContentProps) => (
            <div className="py-1" key={comment.id}>
                <ContentWithComments content={comment}/>
            </div>
        ))}
    </>
}

export default CommentSection