"use client"
import React, { useState } from "react";
import Link from "next/link";
import { ContentProps } from "@/actions/get-content"
import { createComment } from "@/actions/create-content";
import { useRouter } from "next/navigation";
import { addDislike, addLike, removeLike, removeDislike } from "@/actions/likes";

import HtmlContent from "./editor/ckeditor-html-content";
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';

import dynamic from 'next/dynamic';

const CommentEditor = dynamic( () => import( '@/components/editor/comment-editor' ), { ssr: false } );


export const CommentCount: React.FC<{content: ContentProps}> = ({content}) => {
    return <Link className="text-gray-600 text-sm hover:text-gray-800" href={"/contenido/" + content.id}>
    {content._count.childrenComments} comentarios
    </Link>
}


const ReactionCounter = async ({icon, initialCount, isLiked, contentId}) => {
    const [liked, setLiked] = useState(isLiked)

    const likeCount = initialCount + liked

    return <>
        {liked ?
            <button onClick={async () => {setLiked(false); await removeLike(contentId)}} className="text-sm mr-1">
                {icon}               
            </button> : 
            <button onClick={async () => {setLiked(false); await removeLike(contentId)}} className="text-sm mr-1">
                {icon}               
            </button>
        }
        <div className="text-gray-600 text-sm">{likeCount}</div>
    </>
}


export const ContentTopRow: React.FC<{content: ContentProps}> = ({type, content}) => {
    const date = getDate(content)
    return <div className="flex justify-between">
        <p className="text-gray-600 ml-2 text-sm">
            <Link className="hover:text-gray-900"
                  href={"/perfil/" + content.author?.id.slice(1)}>{content.author?.name} {content.author?.id}</Link>
        </p>
        <p className="text-gray-600 text-sm mr-1">{date}</p>
    </div>
}


export const ContentText: React.FC<{content: ContentProps, isMainContent: boolean}> = ({content, isMainContent}) => {
    if(content.type == "FastPost" || content.type == "Comment") {
        return <HtmlContent content={content.text}/>
    } else if(content.type == "Post") {
        if(isMainContent){
            return <HtmlContent content={content.text}/>
        } else {
            return <div className="flex">
                <span className="mr-4">Publicación:</span>
                <HtmlContent content={content.text.split("</h1>")[0].split("<h1>")[1]}/>
            </div>
        }
    } else {
        console.log("El texto es", content.text)
        return <>Tipo de contenido desconocido</>
    }
}

export function getDate(content: ContentProps): string {
    const options = {
        day: 'numeric',
        month: 'long',
        // to do: agregar año si no es el año actual
    };

    return content.createdAt.toLocaleDateString('es-AR', options)
}

export const AddCommentButton: React.FC<{text: string, onClick: () => void}> = ({text, onClick}) => {
    return <button className="text-gray-600 text-sm mr-2 hover:text-gray-800" onClick={onClick}>
        <div className="px-1">
            {text}
        </div>
    </button>
}

const ContentComponent: React.FC<{content: ContentProps, isMainContent: boolean}> = ({content, isMainContent}) => {
    const [writingComment, setWritingComment] = useState(false)

    const router = useRouter()

    const handleCancelComment = () => {
        setWritingComment(false)
    }

    const handleAddCommentClick = () => {
        setWritingComment(true)
    }

    const handleAddOpinionClick = () => {
        setWritingComment(false)
    }

    const handleAddComment = async (comment) => {
        if(writingComment){
            await createComment(comment, content.id)
        }
        setWritingComment(false)
        router.refresh()
    }

    return <>
        <div className={isMainContent ? "border" : "border rounded"}
        >
            <ContentTopRow content={content}/>
            <div className="px-2">
                <ContentText content={content} isMainContent={isMainContent}/>
            </div>
            <div className="flex justify-between px-1">
                <div>
                    <AddCommentButton text="Responder" onClick={handleAddCommentClick}/>
                    {content.type == "Discussion" ? <AddCommentButton text="Opinar" onClick={handleAddOpinionClick}/> : <></>}
                </div>

                <div className="flex justify-between">
                    <div className="flex justify-between px-3">
                        <Link className="text-gray-600 text-sm hover:text-gray-800 ml-2" href={"/contenido/" + content.id}>
                            <CommentOutlinedIcon sx={{ fontSize: 18 }}/> {content._count.childrenComments}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
        {writingComment && <div>
            <div className="mt-1 mb-2">
                <CommentEditor
                    onSubmit={handleAddComment}
                    onCancel={handleCancelComment}
                />
            </div>
        </div>
        }
    </>
};

export default ContentComponent;

/*
<div className="flex justify-between items-center px-3">
                        <ReactionCounter 
                            icon={<ThumbUpOutlinedIcon sx={{ fontSize: 18 }}/>}
                            initialCount={content._count.likedBy}
                            isLiked={content.likeState == "liked"}
                            contentId={content.id}
                        />
                    </div>
                    <div className="flex justify-between items-center px-3">
                        <ReactionCounter 
                            icon={<ThumbDownOutlinedIcon sx={{ fontSize: 18 }}/>}
                            initialCount={content._count.dislikedBy}
                            isLiked={content.likeState == "disliked"}
                            contentId={content.id}
                        />
                    </div>
                */