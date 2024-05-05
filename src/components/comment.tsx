import React from "react";
import Link from "next/link";
import {inter, lusitana} from "@/app/layout"
import {getUserIdByUsername} from "@/actions/get-user";
import parse from 'html-react-parser'

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

async function replaceAsync(string, regexp, replacerFunction) {
    const replacements = await Promise.all(
        Array.from(string.matchAll(regexp),
            match => replacerFunction(...match)));
    let i = 0;
    return string.replace(regexp, () => replacements[i++]);
}

const CommentContent = async ({comment}) => {

    async function replaceMention(match, username) {
        const user = await getUserIdByUsername(username)
        if (user) {
            return `<a href="/profile/${user.id}" style="color: skyblue;">@${username}</a>`;
        } else {
            return match
        }
    }
    const withLinks = await replaceAsync(comment.content, /@(\w+)/g, replaceMention);
    return <div className="px-3">
        <div className={`${inter.className} antialiased text-gray-900`}>
            {parse(withLinks)}
        </div>
    </div>
}

const Comment: React.FC<{ comment: CommentProps }> = ({comment}) => {
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

            <CommentContent comment={comment}/>
            <Link className="flex justify-end text-gray-600 text-sm mr-1" href={"/comment/" + comment.id}>
                {comment._count.childrenComments} comentarios
            </Link>
        </div>
    );
};

export default Comment;