"use client"
import { ContentProps } from "@/actions/get-content";
import CommentEditor from "./editor/comment-editor";
import { createComment } from "@/actions/create-content";


export const NewComment: React.FC<{content: ContentProps, onNewComment: any}> = ({content, onNewComment}) => {
    const handleAddComment = async (comment) => {
        const newComment = await createComment(comment, content.id)
        onNewComment(newComment)
    }

    return <>
        <div>
            <div className="mb-8">
                <CommentEditor
                    onSubmit={handleAddComment}
                />
            </div>
        </div>
    </>
};

