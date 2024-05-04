import React from "react";
import Link from "next/link";
import {inter, lusitana} from "@/app/layout"

export type CommentProps = {
    id: string;
    title: string;
    createdAt: Date
    author: {
        id: string
        name: string
        username: string
    } | null;
    content: string;
    _count: {
        childrenComments: number
    }
};

const Comment: React.FC<{ comment: CommentProps }> = ({ comment }) => {
    const options = {
        day: 'numeric',
        month: 'long',
        year: comment.createdAt.getFullYear() == (new Date()).getFullYear() ? undefined : 'numeric'
    };


    const date = comment.createdAt.toLocaleDateString('es-AR', options)

    return (
        <div className="bg-white border-b">
            <div className="flex justify-between mb-2">
                <p className="text-gray-600 ml-2 text-sm">
                    <Link className="hover:text-gray-900"
                          href={"/profile/" + comment.author?.id}>{comment.author?.name} @{comment.author?.username}</Link>
                </p>
                <p className="text-gray-600 text-sm mr-1">{date}</p>
            </div>

            <div className="px-3">
                <a className={`${inter.className} antialiased text-gray-900`} href={`/comment/${comment.id}`}>{comment.content}</a>
            </div>
            <p className="flex justify-end text-gray-600 text-sm mr-1">{comment._count.childrenComments} comentarios</p>
        </div>
    );
};

export default Comment;