"use client"
import { useRouter } from "next/navigation";
import { Authorship, ContentTopRow, LikeAndCommentCounter } from "./content"

import { ContentProps } from 'src/app/lib/definitions';
import { PostIcon } from "./icons";
import { useState } from "react";


type PostOnFeedProps = {
    content: ContentProps,
    onViewComments: () => void,
    viewingComments: boolean
}


export const PostTitleOnFeed = ({title}: {title: string}) => {
    return <div className="flex items-center px-2 py-2">
        <div className="px-1 font-bold content">
            {title}
        </div>
    </div>
}


export const PostOnFeed = ({content, onViewComments, viewingComments}: PostOnFeedProps) => {
    const router = useRouter()

    return <div className="content-container w-full cursor-pointer" onClick={() => {router.push("/contenido/"+content.id)}}>
        <ContentTopRow
            content={content}
            author={true}
            icon={<PostIcon/>}
            showEnterLink={false}
        />
        <PostTitleOnFeed title={content.title}/>
        <div className="flex justify-between mb-1">
            {false &&<div className="px-2 flex justify-between text-sm">
                <Authorship/>
            </div>}
            <div></div>
            <LikeAndCommentCounter disabled={true} contentId={content.id} onViewComments={onViewComments} viewingComments={viewingComments}/>
        </div>
    </div>
}