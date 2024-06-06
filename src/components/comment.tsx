import React from "react";
import Link from "next/link";
import {inter, lusitana} from "@/app/layout"
import {getUserIdByUsername} from "@/actions/get-user";
import parse from 'html-react-parser'
import Image from "next/image";

export type CommentProps = {
    id: string;
    createdAt: Date
    author: {
        id: string
        name: string
        username: string
    };
    text: string;
    _count: {
        childrenComments: number
    }
    type: string
};

async function replaceAsync(text: string, regexp: RegExp, 
    replacerFunction: (match: string, replace: string) => Promise<string>) {
    const replacements = await Promise.all(
        Array.from(text.matchAll(regexp), ([match, replace]) => replacerFunction(match, replace)));
    let i = 0;
    return text.replace(regexp, () => replacements[i++]);
}

type ContentWithLinks = React.JSX.Element | string | React.JSX.Element[]

async function getContentWithLinks(comment: CommentProps): Promise<ContentWithLinks> {
    async function replaceMention(match: string, username: string): Promise<string> {
        const user = await getUserIdByUsername(username)
        if (user) {
            return `<a href="/profile/${user.id}" style="color: skyblue;">@${username}</a>`;
        } else {
            return match
        }
    }

    const withLinks = await replaceAsync(comment.text, /@(\w+)/g, replaceMention);

    return parse(withLinks)
}

const ContentText: React.FC<{text: ContentWithLinks}> = ({text}) => {
    return <div className="px-3">
    <div className={`${inter.className} antialiased text-gray-900`}>
        {text}
    </div>
    </div>
}

const CommentComponent: React.FC<{comment: CommentProps}> = async ({comment}) => {
    const options = {
        day: 'numeric',
        month: 'long',
        year: comment.createdAt.getFullYear() == (new Date()).getFullYear() ? undefined : 'numeric'
    };

    const date = comment.createdAt.toLocaleDateString('es-AR', options)

    const textWithLinks: ContentWithLinks = await getContentWithLinks(comment)
    const symbol: string = {"Discussion": "👥", "Post": "💬", "Opinion": "", "Comment": ""}[comment.type]
    
    return <div className="bg-white border-b border-t">
        <div className="flex justify-between mb-2">
            <p className="text-gray-600 ml-2 text-sm">
                <Link className="hover:text-gray-900"
                        href={"/profile/" + comment.author?.id}>{comment.author?.name} @{comment.author?.username}</Link>
            </p>
            <p>{symbol}</p>
            <p className="text-gray-600 text-sm mr-1">{date}</p>
        </div>

        <ContentText text={textWithLinks}/>
        <Link className="flex justify-end text-gray-600 text-sm mr-1" href={"/content/" + comment.id}>
            {comment._count.childrenComments} comentarios
        </Link>
    </div>
};

export default CommentComponent;