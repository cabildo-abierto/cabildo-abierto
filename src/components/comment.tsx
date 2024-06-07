import React from "react";
import Link from "next/link";
import {inter, lusitana} from "@/app/layout"
import {getUserIdByUsername} from "@/actions/get-user";
import parse from 'html-react-parser'

export type ContentProps = {
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

export async function replaceAsync(text: string, regexp: RegExp, 
    replacerFunction: (match: string, replace: string) => Promise<string>) {
    const replacements = await Promise.all(
        Array.from(text.matchAll(regexp), ([match, replace]) => replacerFunction(match, replace)));
    let i = 0;
    return text.replace(regexp, () => replacements[i++]);
}

export type ContentWithLinks = React.JSX.Element | string | React.JSX.Element[]

export async function getContentWithLinks(comment: ContentProps): Promise<ContentWithLinks> {
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

export const ContentText: React.FC<{content: ContentProps}> = async ({content}) => {
    const textWithLinks: ContentWithLinks = await getContentWithLinks(content)
    return <div className="px-3">
    <div className={`${inter.className} antialiased text-gray-900`}>
        {textWithLinks}
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

const CommentComponent: React.FC<{content: ContentProps}> = async ({content}) => {
    return <div className="bg-white border-b border-t">
        <ContentTopRow type="" content={content}/>
        <ContentText content={content}/>

        <div className="flex justify-between px-1">
            <div>
                <AddCommentButton text="Agregar comentario" onClick={() => {}}/>
            </div>
            <Link className="text-gray-600 text-sm hover:text-gray-800" href={"/content/" + content.id}>
                {content._count.childrenComments} comentarios
            </Link>
        </div>
    </div>
};

export default CommentComponent;