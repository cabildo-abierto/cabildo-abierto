"use client"

import { ContentAndChildrenProps, ContentProps } from "@/actions/get-content"
import { ContentWithComments } from "@/components/content-with-comments"

const CommentSection: React.FC<{comments: ContentAndChildrenProps[]}> = ({comments}) => {

    return <>
        {comments.map((comment: any) => (
            <div className="py-1" key={comment.content.id}>
                <ContentWithComments content={comment.content} comments={comment.children}/>
            </div>
        ))}
    </>
}

export default CommentSection