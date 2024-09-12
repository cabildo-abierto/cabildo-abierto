"use client"
import { useRouter } from "next/navigation";
import { Authorship, ContentTopRow, LikeAndCommentCounter } from "./content"

import { PostIcon } from "./icons";
import { ContentProps } from "../app/lib/definitions";

type PostOnFeedProps = {
    content: ContentProps,
    onViewComments: () => void,
    viewingComments: boolean
}


export const PostTitleOnFeed = ({title}: {title: string}) => {
    return <h4 className="px-1">
        {title}
    </h4>
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
        <div className="p-2">
            <PostTitleOnFeed title={content.title}/>
        </div>
        <div className="flex justify-between mb-1">
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