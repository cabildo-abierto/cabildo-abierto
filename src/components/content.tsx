"use client"
import React, { useState } from "react";
import Link from "next/link";
import { ContentProps } from "@/actions/get-content"
import { createComment } from "@/actions/create-content";
import { useRouter } from "next/navigation";

import HtmlContent from "./editor/ckeditor-html-content";
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';

import dynamic from 'next/dynamic';
import { splitPost } from "./utils";
import { DateAndTimeComponent, DateComponent } from "./date";
import { LikeCounter } from "./like-counter";

const CommentEditor = dynamic( () => import( '@/components/editor/comment-editor' ), { ssr: false } );


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


export const ContentText: React.FC<{content: ContentProps, isMainContent: boolean}> = ({content, isMainContent}) => {
    if(content.type == "FastPost" || content.type == "Comment") {
        return <HtmlContent content={content.text}/>
    } else if(content.type == "Post") {
        if(isMainContent){
            return <HtmlContent content={content.text}/>
        } else {
            return <div className="flex">
                <span className="mr-4">Publicación:</span>
                <HtmlContent content={splitPost(content).title}/>
            </div>
        }
    } else {
        console.log("El texto es", content.text)
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
                <div className="flex">
                    <LikeCounter content={content}/>
                    <div className="flex items-center px-3">
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