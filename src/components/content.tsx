"use client"

import React, { useEffect, useRef } from "react";
import Link from "next/link";

import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';

import { stopPropagation } from "./utils";
import { DateSince } from "./date";
import { LikeCounter } from "./like-counter";
import { Post } from "./post";
import EntityComponent from "@/components/entity-component";
import { PostOnFeed } from "./post-on-feed";
import { useContent } from "@/app/hooks/contents";
import { FastPost } from "./fast-post";
import { Comment } from "./comment"
import { ContentProps } from "@/app/lib/definitions";
import { ReactionButton } from "./reaction-button";
import CommentIcon from '@mui/icons-material/Comment';
import LoadingSpinner from "./loading-spinner";
import { useUser } from "@/app/hooks/user";
import { addView } from "@/actions/likes";
import { ViewsCounter } from "./views-counter";
import { useSWRConfig } from "swr";


export const CommentCount: React.FC<{content: ContentProps}> = ({content}) => {
    return <Link className="text-gray-600 text-sm hover:text-gray-800" href={"/contenido/" + content.id}>
    {content.childrenContents.length} comentarios
    </Link>
}


export function id2url(id: string){
    return "/perfil/" + id.replace("@", "")
}


export function addAt(id: string){
    if(id.startsWith("@")) return id
    return "@" + id
}


export const ContentTopRow: React.FC<{content: ContentProps, author?: boolean, icon: any}> = ({content, author=true, icon=null}) => {
    const url = content.author  ? id2url(content.author.id) : ""
    const onClick = stopPropagation(() => {})

    return <div className="text-gray-600 px-2 blue-links flex items-center">
        {icon && <div>{icon}</div>}
        <div>
        {author && 
            <span className="px-1">
                <Link 
                href={url} 
                className="hover:text-gray-900 lg:text-sm text-xs"
                onClick={onClick}>
                    {content.author?.name + " " + addAt(content.author?.id)}
                </Link>
            </span>
        }
        <span className="text-gray-600 lg:text-sm text-xs">
            · <DateSince date={content.createdAt}/>
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

type CommentCounterProps = {
    content: ContentProps,
    onViewComments: () => void,
    viewingComments: boolean,
    disabled?: boolean
}

export const CommentCounter = ({viewingComments, disabled, content, onViewComments}: CommentCounterProps) => {
    return <div className="flex items-center px-2">
        <ReactionButton
            icon1={<CommentIcon fontSize="small"/>}
            icon2={<CommentOutlinedIcon fontSize="small"/>}
            count={content.childrenContents.length}
            disabled={disabled}
            active={viewingComments}
            onClick={onViewComments}
        />
    </div>
}

export const LikeAndCommentCounter: React.FC<CommentCounterProps> = ({content, onViewComments, viewingComments, disabled=false}) => {
    return <div className="flex">
        <ViewsCounter contentId={content.id}/>
        <LikeCounter content={content} disabled={disabled}/>
        <CommentCounter content={content} disabled={disabled} viewingComments={viewingComments} onViewComments={onViewComments}/>
    </div>
}


export const Authorship = ({content, onlyAuthor=false}: any) => {
    return <span className="link">
        {onlyAuthor ? "" : "Por "}<Link href={"/perfil/"+content.author?.id}>
            {content.author?.name}
        </Link>
    </span>
}


type ContentComponentProps = {
    contentId: string
    onViewComments: any
    entity?: any
    isPostPage?: boolean
    viewingComments: boolean
    onStartReply: () => void
}


const ContentComponent: React.FC<ContentComponentProps> = ({contentId, onViewComments, viewingComments, entity=null, isPostPage=false, onStartReply}) => {
    const {content, isLoading, isError} = useContent(contentId)
    const {user} = useUser()
    const viewRecordedRef = useRef(false);  // Tracks if view has been recorded
    const {mutate} = useSWRConfig()

    useEffect(() => {
        const recordView = async () => {
            if (user && !viewRecordedRef.current) {
                if(content.type == "Post" && isPostPage || content.type != "Post"){
                    await addView(contentId, user.id);
                    viewRecordedRef.current = true;
                    await mutate("/api/views/"+contentId)
                }
            }
        };
        recordView();
    }, [user, contentId]);

    if(isLoading){
        return <LoadingSpinner/>
    }
    if(isError || !content){
        return <></>
    }
    let element = null
    if(content.type == "Post" && isPostPage){
        element = <Post content={content}/>
    } else if(content.type == "EntityContent"){
        element = <EntityComponent content={content} entity={entity}/>
    } else if(content.type == "Post"){
        element = <PostOnFeed content={content} onViewComments={onViewComments} viewingComments={viewingComments}/>
    } else if(content.type == "FastPost"){
        element = <FastPost content={content} viewingComments={viewingComments} onViewComments={onViewComments} onStartReply={onStartReply}/>
    } else if(content.type == "Comment"){
        element = <Comment content={content} viewingComments={viewingComments} onViewComments={onViewComments} onStartReply={onStartReply}/> 
    }
    return <div className="py-1">{element}</div>
};

export default ContentComponent;