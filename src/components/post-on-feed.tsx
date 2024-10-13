"use client"
import { useRouter } from "next/navigation";
import { Authorship, ContentTopRow, ContentTopRowAuthor, id2url, LikeAndCommentCounter } from "./content"

import { PostIcon } from "./icons";
import { ContentProps } from "../app/lib/definitions";
import ReadOnlyEditor from "./editor/read-only-editor";
import { contentUrl, getPreviewFromJSONStr, stopPropagation } from "./utils";
import Link from "next/link";
import { DateSince } from "./date";
import { fetcher } from "../app/hooks/utils";
import { preload } from "swr";
import { useUser } from "../app/hooks/user";
import { ContentOptionsButton } from "./content-options-button";

type PostOnFeedProps = {
    content: ContentProps,
    onViewComments: () => void,
    viewingComments: boolean
}


export const PostTitleOnFeed = ({title}: {title: string}) => {
    return <span className="text-lg font-bold title">
        {title}
    </span>
}


export const Author = ({content} :{content: ContentProps}) => {
    const url = content.author  ? id2url(content.author.id) : ""
    const router = useRouter()
    const onClick = stopPropagation(() => {router.push(url)})

    return <div className="text-sm">
        <span
            className="hover:underline mr-1 font-bold text-gray-800"
            onClick={onClick}
        >
            {content.author?.name}
        </span>
        <span
            onClick={onClick}
            className="text-[var(--text-light)]"
        >
            @{content.author?.id}
        </span>
    </div>
}


export const PostOnFeed = ({content, onViewComments, viewingComments}: PostOnFeedProps) => {
    const {user} = useUser()
    const router = useRouter()

    function onMouseEnter(){
        preload("/api/content/"+content.id, fetcher)
    }

    const optionList = user && content.author.id == user.id ? ["edit"] : []

    return <div
        onClick={() => {router.push(contentUrl(content.id))}}
        className="flex flex-col hover:bg-[var(--secondary-light)] transition-colors duration-300 ease-in-out cursor-pointer"
        onMouseEnter={onMouseEnter}
    >
        <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-400 ml-2">Publicación</span>

            <div className="flex items-center space-x-1">
                <span className="text-[var(--text-light)] text-sm mr-1">
                    <DateSince date={content.createdAt}/>
                </span>
                {content.isContentEdited && <span className="text-[var(--text-light)] text-sm mr-1">(editado)</span>}
                {optionList.length > 0 && <div className="flex">
                    <ContentOptionsButton content={content} optionList={optionList}/>
                </div>}
            </div>
        </div>

        <div className="flex justify-between px-2 py-2 mb-4">
            <span className="title text-xl py-2">{content.title}</span>
        </div>

        <div className="flex justify-between ml-2 items-center">
            <Author content={content}/>
            <LikeAndCommentCounter
                disabled={true}
                content={content}
                onViewComments={onViewComments}
                viewingComments={viewingComments}
                likeCounterTitle='Cantidad de "me gustas" que recibió. Entrá a la publicación para sumar uno.'
                isPost={true}
                commentCounterTitle="Cantidad de comentarios. Entrá a la publicación para leerlos."
            />
        </div>
    </div>
}