"use client"
import { useRouter } from "next/navigation";
import { ContentTopRowAuthor, id2url, LikeAndCommentCounter } from "./content"

import { ContentProps } from "../app/lib/definitions";
import { contentUrl, stopPropagation } from "./utils";
import { CustomLink as Link } from './custom-link';
import { DateSince } from "./date";
import { fetcher } from "../app/hooks/utils";
import { preload } from "swr";
import { useUser } from "../app/hooks/user";
import { ContentOptionsButton } from "./content-options/content-options-button";
import { ContentType } from "@prisma/client";


export const PostTitleOnFeed = ({title}: {title: string}) => {
    return <span className="text-lg font-bold title">
        {title}
    </span>
}


export const Author = ({content} :{content: ContentProps}) => {
    const url = content.author  ? id2url(content.author.id) : ""
    const router = useRouter()
    const onClick = stopPropagation(() => {router.push(url)})

    return <div className="sm:text-sm text-xs flex flex-wrap mb-1">
        <span
            className="hover:underline mr-1 font-bold text-gray-800"
            onClick={onClick}
        >
            {content.author?.displayName}
        </span>
        <span
            onClick={onClick}
            className="text-[var(--text-light)]"
        >
            @{content.author?.handle}
        </span>
    </div>
}

type PostOnFeedProps = {
    content: {
        id: string
        type: ContentType
        author: {id: string, handle: string, displayName: string}
        createdAt: Date
        isContentEdited: boolean
        title?: string
        parentEntity?: {id: string}
        _count: {
            reactions: number
            childrenTree: number
        }
        uniqueViewsCount: number
    },
    onViewComments: () => void,
    viewingComments: boolean
}


export const PostOnFeed = ({content, onViewComments, viewingComments}: PostOnFeedProps) => {
    const {user} = useUser()

    function onMouseEnter(){
        preload("/api/content/"+content.id, fetcher)
    }

    const optionList = ["share"]
    if(user && (content.author.id == user.id || user.editorStatus == "Administrator"))
        optionList.push("edit")

    if(user && (user.editorStatus == "Administrator" || user.id == content.author.id)){
        optionList.push("delete")
    }

    return <Link
        href={contentUrl(content.id, content.author.id)}
        className="flex flex-col transition-colors duration-300 ease-in-out cursor-pointer"
        onMouseEnter={onMouseEnter}
    >
        <div className="flex justify-between items-center mt-1">
            <span className="text-xs sm:text-sm text-gray-400 ml-2">Publicación</span>

            <div className="flex items-center space-x-1 mr-1">
                <span className="text-[var(--text-light)] text-xs sm:text-sm mr-1">
                    <DateSince date={content.createdAt}/>
                </span>
                {content.isContentEdited && <span
                    className="text-[var(--text-light)] text-xs sm:text-sm mr-1"
                >
                    (editado)
                </span>}
                {optionList.length > 0 && <div className="flex">
                    <ContentOptionsButton content={content} optionList={optionList}/>
                </div>}
            </div>
        </div>

        <div className="flex justify-between px-2 py-2 mb-4">
            <span className="title sm:text-xl text-base py-2">{content.title}</span>
        </div>

        <div className="flex justify-between ml-2 items-center">
            <div className="sm:text-sm text-xs">
                <ContentTopRowAuthor content={content} useLink={false}/>
            </div>
            <LikeAndCommentCounter
                disabled={true}
                content={content}
                onViewComments={onViewComments}
                viewingComments={viewingComments}
                likeCounterTitle='Cantidad de votos hacia arriba que recibió. Entrá a la publicación para sumar uno.'
                isPost={true}
                commentCounterTitle="Cantidad de comentarios. Entrá a la publicación para leerlos."
            />
        </div>
    </Link>
}