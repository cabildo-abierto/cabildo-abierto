"use client"
import { useRouter } from "next/navigation";
import { Authorship, ContentTopRow, ContentTopRowAuthor, id2url, LikeAndCommentCounter } from "./content"

import { PostIcon } from "./icons";
import { ContentProps } from "../app/lib/definitions";
import ReadOnlyEditor from "./editor/read-only-editor";
import { getPreviewFromJSONStr, stopPropagation } from "./utils";
import Link from "next/link";
import { DateSince } from "./date";
import { fetcher } from "../app/hooks/utils";
import { preload } from "swr";

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

    return <div className="text-sm mb-1 flex">
        <div className="mr-1 font-bold text-gray-800">
            <span
            className="hover:underline"
            onClick={onClick}>
                {content.author?.name}
            </span>
        </div>
        <span
            onClick={onClick}
            className="text-[var(--text-light)]"
        >
            @{content.author?.id}
        </span>
    </div>
}


export const PostOnFeed = ({content, onViewComments, viewingComments}: PostOnFeedProps) => {

    function onMouseEnter(){
        preload("/api/content/"+content.id, fetcher)
    }

    return <Link
        href={"/contenido/"+content.id}
        className="flex flex-col hover:bg-[var(--secondary-light)] transition-colors duration-300 ease-in-out"
        onMouseEnter={onMouseEnter}
    >
        <div className="flex justify-between px-2 mt-1">
            <span className="text-sm text-gray-400">Publicación</span>
            <span className="text-[var(--text-light)] text-sm">
                <DateSince date={content.createdAt}/>
            </span>
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
                likeCounterTitle="Entrá a la publicación para reaccionar."
                isPost={true}
            />
        </div>
    </Link>
}