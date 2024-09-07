"use client"

import React, { ReactNode, useEffect, useRef } from "react";
import Link from "next/link";


import { stopPropagation } from "./utils";
import { DateSince } from "./date";
import { LikeCounter } from "./like-counter";
import { Post } from "./post";
import EntityComponent from "src/components/entity-component";
import { PostOnFeed } from "./post-on-feed";
import { useChildrenCount, useContent, useContentComments, useReactions, useViews } from "src/app/hooks/contents";
import { FastPost } from "./fast-post";
import { Comment } from "./comment"
import { ContentProps, EntityProps } from "src/app/lib/definitions";
import { ReactionButton } from "./reaction-button";
import LoadingSpinner from "./loading-spinner";
import { useUser, useUserLikesContent } from "src/app/hooks/user";
import { ViewsCounter } from "./views-counter";
import useSWR, { useSWRConfig } from "swr";
import { ContentOptionsButton } from "./content-options-button";
import { FakeNewsCounter } from "./fake-news-counter";
import { addView } from "src/actions/actions";
import { CommentInContext } from "./comment-in-context";
import { ActiveCommentIcon, ActiveLikeIcon, ActivePraiseIcon, InactiveCommentIcon, InactiveLikeIcon, InactivePraiseIcon } from "./icons";


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

    return <div className="flex justify-between mt-1">
        <div className="text-gray-600 px-2 blue-links flex items-center">
            {icon && <div className="mb-1">{icon}</div>}
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
        {false && <Link className="gray-btn mr-2 mt-1" href={"/contenido/"+content.id}>Entrar a leer</Link>}
        {showOptions && <div className="flex">
            <FakeNewsCounter contentId={content.id} onClick={onShowFakeNews}/>
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

export const CommentCounter = ({viewingComments, disabled, contentId, onViewComments}: CommentCounterProps) => {
    const commentCount = useChildrenCount(contentId)

    return <div className="flex items-center px-2">
        <ReactionButton
            icon1={<ActiveCommentIcon/>}
            icon2={<InactiveCommentIcon/>}
            count={commentCount.isLoading ? "?" : commentCount.count}
            disabled={disabled}
            active={viewingComments}
            onClick={onViewComments}
        />
    </div>
}

type CommentCounterProps = {
    contentId: string,
    onViewComments: () => void,
    viewingComments: boolean,
    disabled?: boolean
    likeCounterTitle?: string
    isPost?: boolean
}

export const LikeAndCommentCounter: React.FC<CommentCounterProps> = ({contentId, onViewComments, viewingComments, disabled=false, likeCounterTitle, isPost=false}) => {
    const icon1 = isPost ? <ActivePraiseIcon/> : <ActiveLikeIcon/>
    const icon2 = isPost ? <InactivePraiseIcon/> : <InactiveLikeIcon/>
    return <div className="flex">
        <ViewsCounter contentId={contentId}/>
        <LikeCounter
            icon1={icon1}
            icon2={icon2}
            contentId={contentId}
            disabled={disabled}
            title={likeCounterTitle}/>
        <CommentCounter contentId={contentId} disabled={disabled} viewingComments={viewingComments} onViewComments={onViewComments}/>
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
}) => {
    const {user} = useUser()
    const reactions = useUserLikesContent(content.id)
    const comments = useContentComments(content.id)
    const viewRecordedRef = useRef(false);  // Tracks if view has been recorded
    const views = useViews(content.id)
    
    const requiresMainPage = content.type == "Post" || content.type == "EntityContent"

    useEffect(() => {
        const recordView = async () => {
            if (user && !viewRecordedRef.current && content && views.views != null) {
                if(requiresMainPage && isMainPage || !requiresMainPage){
                    viewRecordedRef.current = true;
                    await views.mutate(addView(content.id, user.id, content.parentEntityId), {
                        optimisticData: views.views,
                        rollbackOnError: true,
                        populateCache: true,
                        revalidate: false
                    })
                }
            }
        };
        recordView();
    }, [user, content.id, content, views.isLoading]);

    if(reactions.isLoading || views.isLoading){
        return <LoadingSpinner/>
    }
    let element = null
    if(content.type == "Post" && isMainPage){
        element = <Post content={content}/>
    } else if(content.type == "EntityContent"){
        element = <EntityComponent
            setEditing={setEditing}
            contentId={content.id}
            entityId={content.parentEntityId}
            showingChanges={showingChanges}
            editing={editing}
            showingAuthors={showingAuthors}
            isMainPage={isMainPage}
            parentContentId={parentContentId}
        />
    } else if(content.type == "Post"){
        element = <PostOnFeed content={content} onViewComments={onViewComments} viewingComments={viewingComments}/>
    } else if(content.type == "FastPost"){
        element = <FastPost content={content} viewingComments={viewingComments} onViewComments={onViewComments} onStartReply={onStartReply}/>
    } else if(content.type == "Comment" || content.type == "FakeNewsReport"){
        element = <CommentInContext
            content={content}
            viewingComments={viewingComments}
            onViewComments={onViewComments}
            onStartReply={onStartReply}
            inCommentSection={inCommentSection}
            isFakeNewsReport={content.type == "FakeNewsReport"}
        /> 
    }
    return <>{element}</>
};

export default ContentComponent;