"use client"

import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";


import { isPublic, monthly_visits_limit, stopPropagation, visitsThisMonth } from "./utils";
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
import { addView } from "../actions/contents";
import { useUser } from "../app/hooks/user";
import { ContentProps } from "../app/lib/definitions";
import EntityComponent from "./entity-component";
import { UndoDiscussionContent } from "./undo-discussion";
import { logVisit } from "../actions/users";
import { NoVisitsAvailablePopup } from "./no-visits-popup";
import { debounce } from 'lodash'; // You may need to install this if not installed
import { takeAuthorship } from "../actions/admin";
import { decompress } from "./compression";
import { useRouter } from "next/navigation";

export function id2url(id: string){
    return "/perfil/" + id.replace("@", "")
}


export function addAt(id: string){
    if(id.startsWith("@")) return id
    return "@" + id
}


export const ContentTopRowAuthor = ({content, useLink=true} :{content: {author: {name: string, id: string}}, useLink?: boolean}) => {
    const router = useRouter()
    const url = content.author  ? id2url(content.author.id) : ""
    const onClick = stopPropagation(() => {router.push(url)})

    const text = <><span className="hover:underline font-bold  mr-1">  {content.author?.name}
    </span>
    <span className="text-[var(--primary-light)]">
        @{content.author?.id}
    </span></>

    const className = "text-[var(--primary-dark)]"

    if(useLink){
        return <>
            <Link 
                href={url} 
                className={className}
            >
                {text}
            </Link>
        </>
    } else {
        return <div
            onClick={onClick}
            className={className}
        >
            {text}
        </div>
    }
}


type ContentTopRowProps = {
    content: ContentProps
    author?: boolean
    icon: ReactNode
    showOptions?: boolean
    onShowFakeNews?: () => void
    showFakeNewsCounter?: boolean
    optionList?: string[]
}


export const ContentTopRow: React.FC<ContentTopRowProps> = ({
    content,
    author=true,
    icon=null,
    showOptions=false,
    optionList,
    onShowFakeNews,
    showFakeNewsCounter=false,
}) => {
    return <div className="flex justify-between pt-1 pr-1">
        <div className="px-2 blue-links flex items-center w-full">
            <div className="text-xs sm:text-sm space-x-1 text-[var(--text-light)]">
                {icon}
                {author && 
                    <ContentTopRowAuthor content={content}/>
                }
                <span className="">•</span>
                <span className="">
                    <DateSince date={content.createdAt}/>
                </span>
                {content.isContentEdited && <span className="">(editado)</span>}
            </div>
        </div>
        {showFakeNewsCounter && 
            <FakeNewsCounter content={content} onClick={onShowFakeNews}/>
        }
        {showOptions && optionList.length > 0 && <div className="flex">
            <ContentOptionsButton content={content} optionList={optionList}/>
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

export const CommentCounter = ({viewingComments, disabled, content, onViewComments, commentCounterTitle}: CommentCounterProps) => {
    return <div className="flex items-center px-2">
        <ReactionButton
            icon1={<ActiveCommentIcon/>}
            icon2={<InactiveCommentIcon/>}
            count={content._count.childrenTree}
            disabled={disabled}
            active={viewingComments}
            onClick={onViewComments}
            title={commentCounterTitle}
            className="comment-btn"
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
    commentCounterTitle?: string
}

export const LikeAndCommentCounter: React.FC<CommentCounterProps> = ({content, onViewComments, viewingComments, disabled=false, likeCounterTitle, commentCounterTitle, isPost=false}) => {
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
        <CommentCounter
            content={content}
            disabled={disabled}
            viewingComments={viewingComments}
            onViewComments={onViewComments}
            commentCounterTitle={commentCounterTitle}
        />
    </div>
}


export const UserIdLink = ({id}: {id:string}) => {
    return <span className="link">
        <Link href={"/perfil/"+id}>
            @{id}
        </Link>
    </span>
}


export const Authorship = ({content, onlyAuthor=false}: {content: {author: {id: string, name: string}}, onlyAuthor?: boolean}) => {
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
    inItsOwnCommentSection: boolean
    depth?: number
}


const ContentComponent: React.FC<ContentComponentProps> = ({
    content,
    onViewComments,
    viewingComments,
    onStartReply,
    isMainPage = false,
    showingChanges = false,
    showingAuthors = false,
    editing = false,
    setEditing,
    parentContentId,
    inCommentSection,
    inItsOwnCommentSection,
    depth,
}) => {
    const { user } = useUser();
    const viewRecordedRef = useRef(false);
    const [validVisit, setValidVisit] = useState(true);
    const contentRef = useRef(null); // For Intersection Observer
    const requiresMainPage = content.type === 'Post' || content.type === 'EntityContent';

    
    const useVisibility = (ref) => {
        const [isVisible, setIsVisible] = useState(false);

        useEffect(() => {
            const observer = new IntersectionObserver(([entry]) => {
                setIsVisible(entry.isIntersecting);
            });
            if (ref.current) observer.observe(ref.current);

            return () => {
                if (ref.current) observer.unobserve(ref.current);
            };
        }, [ref]);

        return isVisible;
    };

    const isVisible = useVisibility(contentRef);


    // Trigger view recording when content is visible and valid
    useEffect(() => {
        async function recordView() {
            if (isVisible && user && !viewRecordedRef.current && content) {
                if (requiresMainPage && isMainPage || !requiresMainPage) {
                    viewRecordedRef.current = true;
                    await addView(content.id, user.id);
                }
            }
        }
        recordView()
    }, [isVisible, user, content]);

    useEffect(() => {
        async function checkVisit() {
            if (!isPublic(content, isMainPage) && !user) {
                const {user, error} = await logVisit(content.id);
                if(error) return {error}

                const visits = visitsThisMonth(user.visits);
                if (visits >= monthly_visits_limit) {
                    setValidVisit(false);
                }
            }
        }
        checkVisit();
    }, [user, content]);

    // Component rendering logic
    let element = null;
    if (content.type === 'Post' && isMainPage) {
        element = <Post content={content} />;
    } else if (content.type === 'EntityContent') {
        element = (
            <EntityComponent
                setEditing={setEditing}
                content={content}
                entityId={content.parentEntityId}
                showingChanges={showingChanges}
                editing={editing}
                showingAuthors={showingAuthors}
                isMainPage={isMainPage}
                parentContentId={parentContentId}
            />
        );
    } else if (content.type === 'Post') {
        element = (
            <PostOnFeed
                content={content}
                onViewComments={onViewComments}
                viewingComments={viewingComments}
            />
        );
    } else if (content.type === 'FastPost') {
        element = (
            <FastPost
                content={content}
                viewingComments={viewingComments}
                onViewComments={onViewComments}
                onStartReply={onStartReply}
                depth={depth}
                inCommentSection={inCommentSection}
                isMainPage={isMainPage}
            />
        );
    } else if (content.type === 'Comment' || content.type === 'FakeNewsReport') {
        element = (
            <CommentInContext
                content={content}
                viewingComments={viewingComments}
                onViewComments={onViewComments}
                onStartReply={onStartReply}
                inCommentSection={inCommentSection}
                inItsOwnCommentSection={inItsOwnCommentSection}
                isFakeNewsReport={content.type === 'FakeNewsReport'}
                depth={depth}
            />
        );
    } else if (content.type === 'UndoEntityContent') {
        element = (
            <UndoDiscussionContent
                content={content}
                onStartReply={onStartReply}
                onViewComments={onViewComments}
                viewingComments={viewingComments}
            />
        );
    }

    return (
        <>
            {(user && user.editorStatus == "Administrator" && user.id !== content.author.id) && (
                <button
                    className="border mx-1 text-xs hover:bg-[var(--secondary-light)]"
                    onClick={async () => {
                        await takeAuthorship(content.id);
                    }}
                >
                    Tomar autoría
                </button>
            )}
            {!validVisit && <NoVisitsAvailablePopup />}
            <div ref={contentRef}>{element}</div>
        </>
    );
};

export default ContentComponent;
