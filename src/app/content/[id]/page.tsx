import Comment from "@/components/comment";
import React from "react";
import NewComment from "@/app/content/[id]/new-comment";
import {createComment} from "@/actions/create-comment";
import CommentSection from "@/app/content/[id]/comment-section";
import {getContentById, getContentComments} from "@/actions/get-comment";

const CommentPage: React.FC = async ({params}) => {
    const parentContent = await getContentById(params?.id)
    if(!parentContent){
        return false
    }

    const comments = await getContentComments(parentContent.id)

    const handleAddComment = async (comment) => {
        "use server"
        createComment(comment, parentContent.id)
    }

    const title: string = {"Comment": "Comentario", "Discussion": "Discusión", "Post": "Publicación", "Opinion": "Opinion"}[parentContent.type]

    return (
        <div className="">
            <div className="flex flex-col border-l border-r h-full">
                <h1 className="text-2xl ml-2 py-8 font-semibold">
                    {title}
                </h1>
                <div className="mt-8">
                    <Comment comment={parentContent}/>
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
