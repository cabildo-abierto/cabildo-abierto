"use client"

import React from "react";
import Link from "next/link";
import { ContentProps } from "@/actions/get-content"

import HtmlContent from "./editor/html-content";
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';

import { splitPost, stopPropagation } from "./utils";
import { DateAndTimeComponent, DateComponent } from "./date";
import { LikeCounter } from "./like-counter";
import { Post } from "./post";
import EntityComponent from "@/components/entity-component";
import { useRouter } from "next/navigation";
import { UserProps } from "@/actions/get-user";
import { PostOnFeed } from "./post-on-feed";
import { FastPostOrComment } from "./fast-post-or-comment";


export const CommentCount: React.FC<{content: ContentProps}> = ({content}) => {
    return <Link className="text-gray-600 text-sm hover:text-gray-800" href={"/contenido/" + content.id}>
    {content.childrenComments.length} comentarios
    </Link>
}


export const ContentTopRow: React.FC<{content: ContentProps, author?: boolean, icon: any}> = ({content, author=true, icon=null}) => {
    const url = content.author  ? ("/perfil/" + encodeURIComponent(content.author?.id.slice(1))) : ""
    const onClick = stopPropagation((e: any) => {})

    return <div className="text-gray-600 px-2 blue-links flex items-center">
        {icon && <div>{icon}</div>}
        <div>
        {author && 
            <span className="px-1">
                <Link 
                href={url} 
                className="hover:text-gray-900 lg:text-sm text-xs"
                onClick={onClick}>
                    {content.author?.name + " " + content.author?.id}
                </Link>
            </span>
        }
        <span className="text-gray-600 lg:text-sm text-xs">
            · <DateAndTimeComponent date={content.createdAt}/>
        </span>
        </div>
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


export const LikeAndCommentCounter: React.FC<{content: ContentProps, user: UserProps | null, onViewComments: any, viewingComments: boolean}> = ({content, user, onViewComments, viewingComments}) => {
    return <div className="flex">
        <LikeCounter user={user} content={content}/>
        <div className="flex items-center px-2">
            <div 
                className={viewingComments ? "reaction-btn-selected" : "reaction-btn"}
                onClick={stopPropagation(onViewComments)}
            >
                <span className=""><CommentOutlinedIcon sx={{ fontSize: 18 }}/> {content.childrenComments.length}</span>
            </div>
        </div>
    </div>
}


export const Authorship = ({content}: any) => {
    return <span className="mr-4 link">
        Por <Link href={"/perfil/"+content.author?.id.slice(1)}>
            {content.author?.name}
        </Link>
    </span>
}


type ContentComponentProps = {
    content: ContentProps,
    contents: Record<string, ContentProps>,
    onViewComments: any,
    onStartReply: any,
    user: UserProps | null,
    entity?: any,
    isPostPage?: boolean,
    viewingComments: boolean,
    modify?: boolean,
}


const ContentComponent: React.FC<ContentComponentProps> = ({content, contents, user, onViewComments, onStartReply, viewingComments, entity=null, isPostPage=false, modify=false}) => {

    if(content.type == "Post" && isPostPage){
        return <Post content={content} user={user}/>
    } else if(content.type == "EntityContent"){
        return <EntityComponent content={content} entity={entity} modify={modify} user={user}/>
    } else if(content.type == "Post"){
        return <PostOnFeed content={content} user={user}/>
    } else {
        return <FastPostOrComment content={content} contents={contents} user={user} viewingComments={viewingComments} onViewComments={onViewComments} onStartReply={onStartReply}/>
    }

    
};

export default ContentComponent;