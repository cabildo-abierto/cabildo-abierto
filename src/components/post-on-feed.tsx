"use client"
import { useRouter } from "next/navigation";
import { Authorship, ContentTopRow, LikeAndCommentCounter } from "./content"

import { PostIcon } from "./icons";
import { ContentProps } from "../app/lib/definitions";

type PostOnFeedProps = {
    content: ContentProps,
    onViewComments: () => void,
    viewingComments: boolean
    depthParity?: boolean
}


export const PostTitleOnFeed = ({title}: {title: string}) => {
    return <h4 className="">
        {title}
    </h4>
}


export const PostOnFeed = ({content, onViewComments, viewingComments, depthParity=false}: PostOnFeedProps) => {
    const router = useRouter()

    return <div className="w-full cursor-pointer hover:bg-[var(--secondary-light)] transition-colors duration-300 ease-in-out"
        onClick={() => {router.push("/contenido/"+content.id)}}>
        <ContentTopRow
            content={content}
            author={true}
            icon={<PostIcon/>}
            showEnterLink={false}
        />
        <div className="p-2">
            <PostTitleOnFeed title={content.title}/>
        </div>
        <div className="flex justify-between">
            {false &&<div className="px-2 flex justify-between text-sm">
                <Authorship/>
            </div>}
            <div></div>
            <LikeAndCommentCounter
                disabled={true}
                content={content}
                onViewComments={onViewComments}
                viewingComments={viewingComments}
                likeCounterTitle="Entrá a la publicación para reaccionar."
                isPost={true}
            />
        </div>
    </div>
}