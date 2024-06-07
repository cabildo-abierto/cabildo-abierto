"use client"
import React, { useState } from "react";
import Link from "next/link";
import {inter, lusitana} from "@/app/layout"
import TextareaAutosize from "react-textarea-autosize";
import { ContentProps } from "@/actions/get-comment";
import { createComment } from "@/actions/create-comment";

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
        <p>{type}</p>
        <p className="text-gray-600 text-sm mr-1">{date}</p>
    </div>
}

export const ContentText: React.FC<{content: ContentProps}> = ({content}) => {
    return <div className="px-3">
        <div className={`${inter.className} antialiased text-gray-900`}>
            {content.textWithLinks}
        </div>
    </div>
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

const ContentComponent: React.FC<{content: ContentProps}> = ({content}) => {
    const [writingComment, setWritingComment] = useState(false)
    const [comment, setComment] = useState('')

    const type_name = {"Comment": "", "Discussion": "👥", "Post": "💬", "Opinion": ""}[content.type]


    const handleAddCommentClick = () => {
        setWritingComment(true)
    }

    const handleAddComment = async () => {
        await createComment(comment, content.id)
        setWritingComment(false)
    }

    const handleCancelComment = () => {
        setWritingComment(false)
    }

    return <>
        <div className="bg-white border-b border-t">
            <ContentTopRow type={type_name} content={content}/>
            <ContentText content={content}/>

            <div className="flex justify-between px-1">
                <div>
                    <AddCommentButton text="Agregar comentario" onClick={handleAddCommentClick}/>
                    {content.type == "Discussion" ? <AddCommentButton text="Agregar opinión" onClick={() => {}}/> : <></>}
                </div>
                <Link className="text-gray-600 text-sm hover:text-gray-800" href={"/content/" + content.id}>
                    {content._count.childrenComments} comentarios
                </Link>
            </div>
        </div>
        {writingComment ? <div>
            <div className="px-1 mt-1">
            <TextareaAutosize className="w-full text-sm bg-white border rounded-lg p-2 resize-none focus:border-gray-500 transition duration-200"
                placeholder={"Agregá un comentario..."}
                minRows={2}
                onChange={(event) => {setComment(event.target.value)}}
                value={comment}
            />
            </div>
            <div className="flex justify-end">
                <div>
                    <button onClick={handleCancelComment} className="mr-2 text-gray-600 text-sm hover:text-gray-800">Cancelar</button>
                    <button onClick={handleAddComment} className="mr-2 text-gray-600 text-sm hover:text-gray-800">Enviar</button>
                </div>
            </div>
        </div> : <></>}
    </>
};

export default ContentComponent;