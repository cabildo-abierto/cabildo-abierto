"use client"
import React, { useState } from "react";
import Link from "next/link";
import { ContentProps } from "@/actions/get-content"
import { createComment } from "@/actions/create-content";
import { useRouter } from "next/navigation";

import HtmlContent from "./editor/ckeditor-html-content";
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';

import { splitPost } from "./utils";
import { DateAndTimeComponent, DateComponent } from "./date";
import { LikeCounter } from "./like-counter";
import { Post } from "./post";
import EntityComponent from "@/components/entity-component";


export const CommentCount: React.FC<{content: ContentProps}> = ({content}) => {
    return <Link className="text-gray-600 text-sm hover:text-gray-800" href={"/contenido/" + content.id}>
    {content._count.childrenComments} comentarios
    </Link>
}


export const ContentTopRow: React.FC<{content: ContentProps}> = ({type, content}) => {
    return <div className="flex justify-between">
        <div className="text-gray-600 ml-2 text-sm">
            <Link className="hover:text-gray-900"
                  href={"/perfil/" + content.author?.id.slice(1)}>{content.author?.name} {content.author?.id}</Link>
        </div>
        <div className="text-gray-600 text-sm mr-1"><DateAndTimeComponent date={content.createdAt}/></div>
    </div>
}


export const ContentText: React.FC<{content: ContentProps}> = ({content}) => {
    if(content.type == "FastPost" || content.type == "Comment") {
        return <HtmlContent content={content.text}/>
    } else if(content.type == "Post") {
        return <div className="flex">
            <span className="mr-4">Publicación:</span>
            <HtmlContent content={splitPost(content).title}/>
        </div>
    } else {
        return <>Tipo de contenido desconocido</>
    }
}


export const AddCommentButton: React.FC<{text: string, onClick: () => void}> = ({text, onClick}) => {
    return <button className="text-gray-600 text-sm mr-2 hover:text-gray-800" onClick={onClick}>
        <div className="px-1">
            {text}
        </div>
    </button>
}


const ContentComponent = ({content, comments, onViewComments, onStartReply, entity=null, isPostPage=false}) => {
    if(content.type == "Post" && isPostPage){
        return <Post content={content}/>
    } else if(content.type == "EntityContent"){
        return <EntityComponent content={content} entity={entity}/>
    }

    return <>
        <div className="border rounded">
            <ContentTopRow content={content}/>
            <div className="px-2">
                <ContentText content={content}/>
            </div>
            <div className="flex justify-between px-1">
                <div>
                    <AddCommentButton text="Responder" onClick={onStartReply}/>
                </div>
                <div className="flex">
                    <LikeCounter content={content}/>
                    <div className="flex items-center px-3">
                        <button className="text-gray-600 text-sm ml-2" onClick={onViewComments}>
                            <span className="hover:text-gray-800"><CommentOutlinedIcon sx={{ fontSize: 18 }}/></span> {comments.length}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>
};

export default ContentComponent;