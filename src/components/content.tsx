"use client"
import React from "react";
import Link from "next/link";
import { AuthorProps, ContentProps } from "@/actions/get-content"

import HtmlContent from "./editor/ckeditor-html-content";
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';

import { splitPost, stopPropagation } from "./utils";
import { DateAndTimeComponent, DateComponent } from "./date";
import { LikeCounter } from "./like-counter";
import { Post } from "./post";
import EntityComponent from "@/components/entity-component";
import { useRouter } from "next/navigation";


export const CommentCount: React.FC<{content: ContentProps}> = ({content}) => {
    return <Link className="text-gray-600 text-sm hover:text-gray-800" href={"/contenido/" + content.id}>
    {content.childrenComments.length} comentarios
    </Link>
}


export const ContentTopRow: React.FC<{content: ContentProps, author?: boolean}> = ({content, author=true}) => {
    return <div className="flex justify-between">
        <div className="text-gray-600 ml-2 text-sm">
            {author && <Link className="hover:text-gray-900"
                  href={"/perfil/" + content.author?.id.slice(1)}>{content.author?.name} {content.author?.id}</Link>}
        </div>
        <div className="text-gray-600 text-sm mr-1"><DateAndTimeComponent date={content.createdAt}/></div>
    </div>
}


export const AddCommentButton: React.FC<{text: string, onClick: any}> = ({text, onClick}) => {
    return <button className="text-gray-600 text-sm mr-2 hover:text-gray-800"
        onClick={onClick}>
        <div className="px-1">
            {text}
        </div>
    </button>
}


const LikeAndCommentCounter: React.FC<{content: ContentProps, onViewComments: any, comments: any}> = ({content, onViewComments, comments}) => {
    return <div className="flex">
        <LikeCounter content={content}/>
        <div className="flex items-center px-2">
            <div className="text-gray-600 text-sm" onClick={stopPropagation(onViewComments)}>
                <span className="hover:text-gray-800"><CommentOutlinedIcon sx={{ fontSize: 18 }}/></span> {comments.length}
            </div>
        </div>
    </div>
}


type ContentComponentProps = {
    content: ContentProps,
    comments: any,
    onViewComments: any,
    onStartReply: any,
    entity?: any,
    isPostPage?: boolean
}


const ContentComponent: React.FC<ContentComponentProps> = ({content, comments, onViewComments, onStartReply, entity=null, isPostPage=false}) => {
    const router = useRouter()
    
    if(content.type == "Post" && isPostPage){
        return <Post content={content}/>
    } else if(content.type == "EntityContent"){
        return <EntityComponent content={content} entity={entity}/>
    } else if(content.type == "Post"){
        const postSplit = splitPost(content.text)
        const text = postSplit ? postSplit.title : "Error al cargar el contenido"
        return <div className="w-full bg-white text-left cursor-pointer editor-container" onClick={() => {router.push("/contenido/"+content.id)}}>
            <div className="border rounded w-full">
                <ContentTopRow content={content} author={true}/>
                <div className="px-2 mt-2 font-semibold">
                    <HtmlContent content={text}/>
                </div>
                <div className="flex justify-between mb-1">
                    {false && <div className="px-2 flex justify-between">
                        <span className="mr-4">Por <Link href={"/perfil/"+content.author?.id.slice(1)}>{content.author?.name}</Link>
                        </span>
                    </div>}
                    <div></div>
                    <LikeAndCommentCounter content={content} onViewComments={onViewComments} comments={comments}/>
                </div>
            </div>
        </div>
    }

    return <div className="w-full bg-white text-left cursor-pointer editor-container" onClick={() => {router.push("/contenido/"+content.id)}}>
        <div className="border rounded w-full">
            <ContentTopRow content={content}/>
            <div className="px-2">
                <HtmlContent content={content.text}/>
            </div>
            <div className="flex justify-between">
                <div className="px-1">
                    <AddCommentButton text="Responder" onClick={stopPropagation(onStartReply)}/>
                </div>
                <LikeAndCommentCounter content={content} onViewComments={onViewComments} comments={comments}/>
            </div>
        </div>
    </div>
};

export default ContentComponent;