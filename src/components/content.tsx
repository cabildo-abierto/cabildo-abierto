"use client"

import React, { ReactNode, useEffect, useRef } from "react";
import Link from "next/link";


import { stopPropagation } from "./utils";
import { DateSince } from "./date";
import { LikeCounter } from "./like-counter";
import { Post } from "./post";
import { PostOnFeed } from "./post-on-feed";
import { FastPost } from "./fast-post";
import { ReactionButton } from "./reaction-button";
import { ViewsCounter } from "./views-counter";
import { ContentOptionsButton } from "./content-options-button";
import { FakeNewsCounter } from "./fake-news-counter";
import { CommentInContext } from "./comment-in-context";
import { ActiveCommentIcon, ActiveLikeIcon, ActivePraiseIcon, InactiveCommentIcon, InactiveLikeIcon, InactivePraiseIcon } from "./icons";
import { addView, addViewToEntityContent } from "../actions/contents";
import { useUser } from "../app/hooks/user";
import { ContentProps } from "../app/lib/definitions";
import EntityComponent from "./entity-component";


export function id2url(id: string){
    return "/perfil/" + id.replace("@", "")
}


export function addAt(id: string){
    if(id.startsWith("@")) return id
    return "@" + id
}


type ContentTopRowProps = {
    content: ContentProps
    author?: boolean
    icon: ReactNode
    showOptions?: boolean
    onShowFakeNews?: () => void
    showEnterLink?: boolean
}

export const ContentTopRow: React.FC<ContentTopRowProps> = ({
    content,
    author=true,
    icon=null,
    showOptions=false,
    onShowFakeNews,
    showEnterLink=false
}) => {
    const url = content.author  ? id2url(content.author.id) : ""
    const onClick = stopPropagation(() => {})

    return <div className="flex justify-between pt-1">
        <div className="px-2 blue-links flex items-center w-full">
            {icon && <div className="mb-1 text-gray-800">{icon}</div>}
            <div className="flex justify-between w-full">
                {author && 
                    <div className="">
                        <span className="px-1 font-bold text-gray-800">
                            <Link 
                            href={url} 
                            className="hover:underline"
                            onClick={onClick}>
                                {content.author?.name}
                            </Link>
                        </span>
                        <Link href={url} className="text-[var(--text-light)]">
                            @{content.author?.id}
                        </Link>
                    </div>

                }
                <span className="text-gray-600">
                    <DateSince date={content.createdAt}/>
                </span>
            </div>
        </div>
        {false && <Link className="gray-btn mr-2 mt-1" href={"/contenido/"+content.id}>Entrar a leer</Link>}
        {showOptions && <div className="flex">
            <FakeNewsCounter content={content} onClick={onShowFakeNews}/>
            <ContentOptionsButton contentId={content.id}/>
        </div>}
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

export const CommentCounter = ({viewingComments, disabled, content, onViewComments}: CommentCounterProps) => {
    // TO DO: Contar también los hijos de los hijos
    return <div className="flex items-center px-2">
        <ReactionButton
            icon1={<ActiveCommentIcon/>}
            icon2={<InactiveCommentIcon/>}
            count={content._count.childrenTree}
            disabled={disabled}
            active={viewingComments}
            onClick={onViewComments}
        />
    </div>
}

type CommentCounterProps = {
    content: ContentProps,
    onViewComments: () => void,
    viewingComments: boolean,
    disabled?: boolean
    likeCounterTitle?: string
    isPost?: boolean
}

export const LikeAndCommentCounter: React.FC<CommentCounterProps> = ({content, onViewComments, viewingComments, disabled=false, likeCounterTitle, isPost=false}) => {
    const icon1 = isPost ? <ActivePraiseIcon/> : <ActiveLikeIcon/>
    const icon2 = isPost ? <InactivePraiseIcon/> : <InactiveLikeIcon/>
    return <div className="flex mb-1">
        <ViewsCounter content={content}/>
        <LikeCounter
            icon1={icon1}
            icon2={icon2}
            content={content}
            disabled={disabled}
            title={likeCounterTitle}/>
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
    content: ContentProps
    onViewComments: () => void
    isMainPage?: boolean
    viewingComments: boolean
    onStartReply: () => void
    showingChanges?: boolean
    showingAuthors?: boolean
    editing?: boolean
    setEditing: (arg0: boolean) => void
    parentContentId?: string
    inCommentSection: boolean
    depthParity?: boolean
}


const ContentComponent: React.FC<ContentComponentProps> = ({
    content,
    onViewComments,
    viewingComments,
    onStartReply,
    isMainPage=false,
    showingChanges=false,
    showingAuthors=false,
    editing=false,
    setEditing,
    parentContentId,
    inCommentSection,
    depthParity,
}) => {
    const {user} = useUser()
    const viewRecordedRef = useRef(false);  // Tracks if view has been recorded
    
    const requiresMainPage = content.type == "Post" || content.type == "EntityContent"

    useEffect(() => {
        const recordView = async () => {
            if (user && !viewRecordedRef.current && content) {
                if(requiresMainPage && isMainPage || !requiresMainPage){
                    viewRecordedRef.current = true;
                    if(content.type == "EntityContent"){
                        await addViewToEntityContent(content.id, user.id, content.parentEntityId)
                    } else {
                        await addView(content.id, user.id)
                    }
                }
            }
        };
        recordView();
    }, [user, content.id, content]);

    let element = null
    if(content.type == "Post" && isMainPage){
        element = <Post content={content}
        />
    } else if(content.type == "EntityContent"){
        element = <EntityComponent
            setEditing={setEditing}
            content={content}
            entityId={content.parentEntityId}
            showingChanges={showingChanges}
            editing={editing}
            showingAuthors={showingAuthors}
            isMainPage={isMainPage}
            parentContentId={parentContentId}
        />
    } else if(content.type == "Post"){
        element = <PostOnFeed
        content={content}
        onViewComments={onViewComments}
        viewingComments={viewingComments}
        depthParity={depthParity}
        />
    } else if(content.type == "FastPost"){
        element = <FastPost 
            content={content}
            viewingComments={viewingComments}
            onViewComments={onViewComments}
            onStartReply={onStartReply}
            depthParity={depthParity}
            />
    } else if(content.type == "Comment" || content.type == "FakeNewsReport"){
        element = <CommentInContext
            content={content}
            viewingComments={viewingComments}
            onViewComments={onViewComments}
            onStartReply={onStartReply}
            inCommentSection={inCommentSection}
            isFakeNewsReport={content.type == "FakeNewsReport"}
            depthParity={depthParity}
        /> 
    }
    return <>{element}</>
};

export default ContentComponent;