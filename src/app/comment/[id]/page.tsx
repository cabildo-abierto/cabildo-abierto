import Comment from "@/components/comment";
import React from "react";
import NewComment from "@/app/comment/[id]/new-comment";
import {createComment} from "@/actions/create-comment";
import CommentSection from "@/app/comment/[id]/comment-section";
import {getCommentById, getCommentComments} from "@/actions/get-comment";

const CommentPage: React.FC = async ({params}) => {
    const parentComment = await getCommentById(params?.id)

    const comments = await getCommentComments(parentComment.id)

    const handleAddComment = async (comment) => {
        "use server"
        createComment(comment, parentComment.id)
    }

    return (
        <div className="flex justify-center mt-8">
            <div className="flex flex-col w-1/3 border-l border-r h-screen">
                <div className="">
                    <Comment comment={parentComment}/>
                </div>
                <div className="px-2 py-2">
                <NewComment handleAddComment={handleAddComment}/>
                </div>
                <div className="">
                    <CommentSection comments={comments}/>
                </div>
            </div>
        </div>
    )
}

export default CommentPage
