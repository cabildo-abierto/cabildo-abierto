import React from "react";
import CommentSection from "@/app/contenido/[id]/comment-section";
import {getContentById, getContentComments} from "@/actions/get-content";
import { ThreeColumnsLayout } from "@/components/main-layout";
import HtmlContent from "@/components/editor/ckeditor-html-content";
import { splitPost } from "@/components/utils";
import Link from "next/link";
import { DateComponent } from "@/components/date";
import {NewComment} from "@/components/new-comment";


const Post = ({content}) => {
    const split = splitPost(content)
    const title = "<h1>"+split.title+"</h1>"
    return <div className="">
        <HtmlContent content={title}/>
        <div className="flex justify-between editor-container">
            <div className="py-2">Por <Link href={"/perfil/"+content.authorId}>{content.author.name}</Link></div>
            <DateComponent date={content.createdAt}/>
        </div>
        <HtmlContent content={split.text}/>
    </div>
}


const ContentPage: React.FC<{params: any}> = async ({params}) => {
    const parentContent = await getContentById(params?.id)
    if(!parentContent){
        return false
    }

    const comments = await getContentComments(parentContent.id)

    const center = <div className="">
        <div className="flex flex-col h-full">
            <div className="mt-8">
                <Post content={parentContent}/>
            </div>
            <CommentSection parentContent={parentContent} comments={comments}/>
        </div>
    </div>


    return <ThreeColumnsLayout center={center}/>
}

export default ContentPage
