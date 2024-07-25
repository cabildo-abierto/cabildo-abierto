"use client"

import { ContentProps } from "@/actions/get-content"
import { ContentWithComments, getListOfComments } from "@/components/content-with-comments"
import { useContents } from "./use-contents"

const CommentSection: React.FC<{content: ContentProps}> = ({content}) => {
    const {contents, setContents} = useContents()
    if(!contents) return <>Cargando...</>

    const comments = getListOfComments(contents, content)

    return <>
        {comments.map((comment: ContentProps) => (
            <div className="py-1" key={comment.id}>
                <ContentWithComments content={comment}/>
            </div>
        ))}
    </>
}

export default CommentSection