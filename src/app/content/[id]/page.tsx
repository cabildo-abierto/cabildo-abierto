import ContentComponent from "@/components/content";
import React from "react";
import CommentSection from "@/app/content/[id]/comment-section";
import {getContentById, getContentComments} from "@/actions/get-comment";

const ContentPage: React.FC<{params: any}> = async ({params}) => {
    const parentContent = await getContentById(params?.id)
    if(!parentContent){
        return false
    }

    const comments = await getContentComments(parentContent.id)
    const title = {"FastPost": "Publicación","Comment": "Comentario", "Discussion": "Discusión", "Post": "Publicación", "Opinion": "Opinion"}[parentContent.type]

    return <div className="">
        <div className="flex flex-col border-l border-r h-full">
            <h2 className="ml-2 py-8">
                {title}
            </h2>
            <div className="mt-8">
                <ContentComponent content={parentContent} isMainContent={true}/>
            </div>
            <div className="">
                <CommentSection comments={comments}/>
            </div>
        </div>
    </div>
}

export default ContentPage
