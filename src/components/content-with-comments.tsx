"use client"
import CommentSection from "./comment-section"
import ContentComponent from "./content"
import { useState } from "react"
import { createComment } from "@/actions/create-content"
import dynamic from "next/dynamic"
import { ContentProps } from "@/actions/get-content"
import { UserProps } from "@/actions/get-user"


const CommentEditor = dynamic( () => import( '@/components/editor/comment-editor' ), { ssr: false } );


export function getListOfComments(contents: Record<string, ContentProps>, content: ContentProps){
    const comments: ContentProps[] = []
    content.childrenComments.forEach((comment) => {
        comments.push(contents[comment.id])
    })
    return comments
}


type ContentWithCommentsProps = {
    content: ContentProps,
    contents: Record<string, ContentProps>,
    user?: UserProps,
    entity?: any,
    isPostPage?: boolean
}


export const ContentWithComments: React.FC<ContentWithCommentsProps> = ({
    content, contents, user, entity=null, isPostPage=false}) => {
    const startsOpen = (content && content.type == "Post" && isPostPage) || entity
    const [viewComments, setViewComments] = useState(startsOpen) 
    const [writingReply, setWritingReply] = useState(startsOpen)

    const comments = getListOfComments(contents, content)

    const handleNewComment = async (text: string) => {
        if(user){
            await createComment(text, content.id, user.id)
            setViewComments(true)
            setWritingReply(startsOpen)
        }
    }

    const handleCancelComment = () => {
        setWritingReply(false)
    }

    return <div>
        <ContentComponent
            content={content}
            contents={contents}
            user={user}
            onViewComments={() => {setViewComments(!viewComments)}}
            onStartReply={() => {setWritingReply(!writingReply)}}
            entity={entity}
            isPostPage={isPostPage}
            viewingComments={viewComments}
        />
        <div className="">
            {writingReply && <div className="mt-1 mb-2 ml-2">
                {startsOpen ? <CommentEditor user={user} onSubmit={handleNewComment}/> : 
                    <CommentEditor user={user} onSubmit={handleNewComment} onCancel={handleCancelComment}/>
                }
            </div>}
            {(viewComments) && <div className="ml-2">
                <CommentSection user={user} comments={comments} contents={contents}/>
            </div>}
        </div>
    </div>
}