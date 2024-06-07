import CommentComponent from "@/components/comment";
import DiscussionComponent from "@/components/discussion";
import PostComponent from "@/components/post";
import OpinionComponent from "@/components/opinion";
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

    const handleAddComment = async (content) => {
        "use server"
        createComment(content, parentContent.id)
    }

    const title: string = {"Comment": "Comentario", "Discussion": "Discusión", "Post": "Publicación", "Opinion": "Opinion"}[parentContent.type]

    let mainContentElement: React.JSX.Element
    if(parentContent.type == "Discussion"){
        mainContentElement = <DiscussionComponent content={parentContent}/>
    } else if(parentContent.type == "Post"){
        mainContentElement = <PostComponent content={parentContent}/>
    } else if(parentContent.type == "Comment"){
        mainContentElement = <CommentComponent content={parentContent}/>
    } else {
        mainContentElement = <OpinionComponent content={parentContent}/>
    }

    return (
        <div className="">
            <div className="flex flex-col border-l border-r h-full">
                <h1 className="text-2xl ml-2 py-8 font-semibold">
                    {title}
                </h1>
                <div className="mt-8">
                    {mainContentElement}
                </div>
                <div className="">
                    <CommentSection comments={comments}/>
                </div>
            </div>
        </div>
    )
}

export default CommentPage
