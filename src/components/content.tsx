"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import TextareaAutosize from "react-textarea-autosize";
import { ContentProps } from "@/actions/get-comment";
import { createComment, createOpinion } from "@/actions/create-comment";
import { useRouter } from "next/navigation";
import { addDislike, addLike } from "@/actions/likes";
import Image from 'next/image';

import { createEditor, Descendant, Editor } from 'slate';
import { withReact } from 'slate-react';
import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import MyEditor from "@/app/escribir/editor";
import { ReadOnlyEditor } from "@/app/escribir/readonly_editor";
type CustomElement = { type: 'paragraph'; children: CustomText[] }
type CustomText = { text: string; bold?: true }

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}

export const CommentCount: React.FC<{content: ContentProps}> = ({content}) => {
    return <Link className="text-gray-600 text-sm hover:text-gray-800" href={"/content/" + content.id}>
    {content._count.childrenComments} comentarios
    </Link>
}

export const ContentTopRow: React.FC<{type: string, content: ContentProps}> = ({type, content}) => {
    const date = getDate(content)
    return <div className="flex justify-between mb-2">
        <p className="text-gray-600 ml-2 text-sm">
            <Link className="hover:text-gray-900"
                  href={"/profile/" + content.author?.id}>{content.author?.name} @{content.author?.username}</Link>
        </p>
        <p className="text-gray-600 text-sm">{type}</p>
        <p className="text-gray-600 text-sm mr-1">{date}</p>
    </div>
}


export const ContentText: React.FC<{content: ContentProps, isMainContent: boolean, onCommentClick: any}> = ({content, isMainContent, onCommentClick}) => {
    const [editor] = useState(() => withReact(createEditor()))

    const initialValue: Descendant[] = JSON.parse(content.text)

    return <ReadOnlyEditor initialValue={initialValue} onCommentClick={onCommentClick}/>
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

const ContentComponent: React.FC<{content: ContentProps, isMainContent: boolean}> = ({content, isMainContent}) => {
    const [writingComment, setWritingComment] = useState(false)
    const [writingOpinion, setWritingOpinion] = useState(false)
    const [comment, setComment] = useState('')
    const [replyTo, setReplyTo] = useState('')

    const router = useRouter()
    let like_count: Number = content._count.likedBy
    let dislike_count: Number = content._count.dislikedBy

    const type_name = {"Comment": "", "Discussion": "Discusión", "Post": "Publicación", "Opinion": "Opinión"}[content.type]

    const handleCancelComment = () => {
        setWritingComment(false)
        setWritingOpinion(false)
    }

    const handleAddCommentClick = () => {
        setWritingOpinion(false)
        setWritingComment(true)
    }

    const handleAddOpinionClick = () => {
        setWritingComment(false)
        setWritingOpinion(true)
    }

    const handleAddComment = async () => {
        if(writingComment){
            await createComment(comment, content.id)
        } else {
            await createOpinion(comment, content.id)
        }
        setWritingComment(false)
        setWritingOpinion(false)
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
        const selected_test = Editor.string(editor, selection)
        setWritingComment(true)
        setWritingOpinion(false)
        setReplyTo(selected_test)   
    }

    return <>
        <div className={isMainContent ? "border-4 border-gray-300 rounded" : "border-b border-t"}
        >
            <ContentTopRow type={type_name} content={content}/>
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
        {(writingComment || writingOpinion) ? <div>
            <div className="px-1 mt-1">
            <p className="py-2 px-2 text-sm">En respuesta a: <span className="text-gray-500 italic">{replyTo}</span></p>
            <MyEditor
                placeholder={writingComment ? "Agregá un comentario..." : "Agregá una opinión..."}
                minHeight="4em"
                onChange={setComment}
            />
            </div>
            <div className="flex justify-end">
                <div>
                    <button onClick={handleCancelComment} className="mr-2 text-gray-600 text-sm hover:text-gray-800">Cancelar</button>
                    <button onClick={handleAddComment} className="mr-2 text-gray-600 text-sm hover:text-gray-800">{writingComment ? "Enviar" : "Enviar"}</button>
                </div>
            </div>
        </div> : <></>}
    </>
};

export default ContentComponent;