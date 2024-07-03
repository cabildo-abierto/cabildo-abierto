"use client"
import React, { useState } from "react";
import Link from "next/link";
import { ContentProps } from "@/actions/get-comment";
import { createComment } from "@/actions/create-comment";
import { useRouter } from "next/navigation";
import { addDislike, addLike } from "@/actions/likes";
import Image from 'next/image';
import dynamic from "next/dynamic";
import FastEditor from "./editor/fast-editor";
const ReadOnlyEditor = dynamic( () => import( '@/components/editor/read-only-editor' ), { ssr: false } );
const ReadOnlyFastEditor = dynamic( () => import( '@/components/editor/read-only-fast-editor' ), { ssr: false } );


export const CommentCount: React.FC<{content: ContentProps}> = ({content}) => {
    return <Link className="text-gray-600 text-sm hover:text-gray-800" href={"/content/" + content.id}>
    {content._count.childrenComments} comentarios
    </Link>
}

export const ContentTopRow: React.FC<{content: ContentProps}> = ({type, content}) => {
    const date = getDate(content)
    return <div className="flex justify-between">
        <p className="text-gray-600 ml-2 text-sm">
            <Link className="hover:text-gray-900"
                  href={"/profile/" + content.author?.id}>{content.author?.name} @{content.author?.username}</Link>
        </p>
        <p className="text-gray-600 text-sm mr-1">{date}</p>
    </div>
}


export const ContentText: React.FC<{content: ContentProps, isMainContent: boolean, onCommentClick: any}> = ({content, isMainContent, onCommentClick}) => {
    if(content.type == "FastPost" || content.type == "Comment") {
        return <ReadOnlyFastEditor content={content.text}/>
    } else if(content.type == "Post") {
        if(isMainContent){
            return <ReadOnlyEditor content={content.text}/>
        } else {
            return <ReadOnlyFastEditor content={"Post: " + content.text.split("</h1>")[0].split("<h1>")[1]}/>
        }
    } else {
        return <>Tipo de contenido desconocido</>
    }
}

export function getDate(content: ContentProps): string {
    const options = {
        day: 'numeric',
        month: 'long',
        year: content.createdAt.getFullYear() == (new Date()).getFullYear() ? undefined : 'numeric'
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

type SelectionCitation = {
    text: string
    start: number
    end: number
} | null

const ContentComponent: React.FC<{content: ContentProps, isMainContent: boolean}> = ({content, isMainContent}) => {
    const [writingComment, setWritingComment] = useState(false)
    const [comment, setComment] = useState('')
    const [replyTo, setReplyTo] = useState<SelectionCitation>(null)

    const router = useRouter()
    let like_count: Number = content._count.likedBy
    let dislike_count: Number = content._count.dislikedBy

    const handleCancelComment = () => {
        setWritingComment(false)
    }

    const handleAddCommentClick = () => {
        setWritingComment(true)
    }

    const handleAddOpinionClick = () => {
        setWritingComment(false)
    }

    const handleAddComment = async () => {
        if(writingComment){
            await createComment(comment, replyTo, content.id)
        }
        setWritingComment(false)
        router.refresh()
    }

    const handleLike = async () => {
        if(content.likeState == "liked") return
        await addLike(content.id)
    }

    const handleDislike = async () => {
        if(content.likeState == "disliked") return
        await addDislike(content.id)
    }
    
    const onSelectionComment = async (editor, selection) => {
        setWritingComment(true)
        setReplyTo({
            text: Editor.string(editor, selection),
            start: selection.anchor.offset,
            end: selection.focus.offset
        })
    }

    return <>
        <div className={isMainContent ? "border-b border-t" : "border rounded"}
        >
            <ContentTopRow content={content}/>
            <ContentText content={content} isMainContent={isMainContent} onCommentClick={onSelectionComment}/>
            <div className="flex justify-between px-1">
                <div>
                    <AddCommentButton text="Responder" onClick={handleAddCommentClick}/>
                    {content.type == "Discussion" ? <AddCommentButton text="Opinar" onClick={handleAddOpinionClick}/> : <></>}
                </div>

                <div className="flex justify-between">
                    <div className="flex justify-between px-3">
                        <button onClick={handleLike} className="text-sm mr-1">
                            <Image src="/thumbs-up.png" width={16} height={16} alt={"thumbs up"}/>
                        </button>
                        <div className="text-gray-600 text-sm">{like_count}</div>
                    </div>
                    <div className="flex justify-between px-3">
                        <button onClick={handleDislike} className="text-sm mr-1">
                            <Image src="/thumbs-down.png" width={16} height={16} alt={"thumbs down"}/>
                        </button>
                        <div className="text-gray-600 text-sm">{dislike_count}</div>
                    </div>
                    <div className="flex justify-between px-3">
                        <Link className="text-gray-600 text-sm hover:text-gray-800 ml-2" href={"/content/" + content.id}>
                            💬 {content._count.childrenComments}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
        {writingComment && <div>
            <div className="px-1 mt-1 ml-2 mb-2">
            {replyTo &&
                <p className="py-2 px-2 text-sm">En respuesta a: <span className="text-gray-500 italic">{replyTo.text}</span></p>
            }
            <FastEditor
                onSubmit={handleAddComment}
            />
            </div>
            <div className="flex justify-end">
                <div>
                    <button onClick={handleCancelComment} className="mr-2 text-gray-600 text-sm hover:text-gray-800">Cancelar</button>
                    <button onClick={handleAddComment} className="mr-2 text-gray-600 text-sm hover:text-gray-800">{writingComment ? "Enviar" : "Enviar"}</button>
                </div>
            </div>
        </div>}
    </>
};

export default ContentComponent;