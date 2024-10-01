"use client"
import { useRouter } from "next/navigation";
import { Authorship, ContentTopRow, ContentTopRowAuthor, LikeAndCommentCounter } from "./content"

import { PostIcon } from "./icons";
import { ContentProps } from "../app/lib/definitions";
import ReadOnlyEditor from "./editor/read-only-editor";
import { getPreviewFromJSONStr } from "./utils";
import Link from "next/link";
import { DateSince } from "./date";

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


export const PostOnFeed = ({content, onViewComments, viewingComments}: PostOnFeedProps) => {

    return <Link
        href={"/contenido/"+content.id}
        className="flex flex-col hover:bg-[var(--secondary-light)] transition-colors duration-300 ease-in-out">
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
            <ContentTopRowAuthor content={content}/>
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