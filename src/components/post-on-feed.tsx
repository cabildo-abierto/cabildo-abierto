"use client"
import { useRouter } from "next/navigation";
import { Authorship, ContentTopRow, LikeAndCommentCounter } from "./content"

import { ContentProps } from '@/app/lib/definitions';
import { PostIcon } from "./icons";


type PostOnFeedProps = {
    content: ContentProps,
    onViewComments: () => void,
    viewingComments: boolean
}


export const PostOnFeed = ({content, onViewComments, viewingComments}: PostOnFeedProps) => {
    const router = useRouter()
    return <div className="w-full bg-[var(--background)] text-left cursor-pointer" onClick={() => {router.push("/contenido/"+content.id)}}>
        <div className="border rounded w-full">
            <ContentTopRow content={content} author={true} icon={<PostIcon/>} showOptions={false}/>
            <div className="flex items-center px-2 py-2">
                <div className="px-1 font-bold content">
                    {content.title}
                </div>
            </div>
            <div className="flex justify-between mb-1">
                {false &&<div className="px-2 flex justify-between text-sm">
                    <Authorship/>
                </div>}
                <div></div>
                <LikeAndCommentCounter disabled={true} content={content} onViewComments={onViewComments} viewingComments={viewingComments}/>
            </div>
        </div>
    </div>
}