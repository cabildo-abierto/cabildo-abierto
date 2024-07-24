"use client"
import CommentSection from "./comment-section"
import ContentComponent from "./content"
import { useState } from "react"
import { createComment } from "@/actions/create-content"
import dynamic from "next/dynamic"
import { AuthorProps, ContentAndChildrenProps, ContentProps } from "@/actions/get-content"
import { useUser } from "./user-provider"

const CommentEditor = dynamic( () => import( '@/components/editor/comment-editor' ), { ssr: false } );

function mockComment(createdAt: Date, text: string, author: AuthorProps): ContentAndChildrenProps {
    return {
        content: {
            id: "mock",
            createdAt: createdAt,
            text: text,
            author: author,
            _count: {
                likedBy: 0,
                dislikedBy: 0
            },
            type: "Comment",
            childrenComments: []
        },
        children: []
    }
}

type ContentWithComments = {
    content: any,
    comments: ContentAndChildrenProps[],
    entity: any,
    isPostPage: boolean
}

export const ContentWithComments: React.FC<any> = ({content, comments, entity=null, isPostPage=false}) => {
    const startsOpen = (content.type == "Post" && isPostPage) || content.type == "EntityContent"
    const [viewComments, setViewComments] = useState(startsOpen) 
    const [writingReply, setWritingReply] = useState(startsOpen)
    const [updatedComments, setUpdatedComments] = useState(comments)
    const {user} = useUser()

    const handleNewComment = async (text: string) => {
        if(user){
            const mock = mockComment(new Date(), text, {id: user.id, name: user.name})
            setWritingReply(false)
            setUpdatedComments([mock, ...updatedComments])
            const newComment = await createComment(text, content.id, user.id)
            setUpdatedComments([newComment, ...updatedComments])
            setViewComments(true)
        }
    }

    const handleCancelComment = () => {
        setWritingReply(false)
    }

    return <div>
        <ContentComponent
            content={content}
            comments={updatedComments}
            onViewComments={() => {setViewComments(!viewComments)}}
            onStartReply={() => {setWritingReply(!writingReply)}}
            entity={entity}
            isPostPage={isPostPage}
        />
        {isPostPage && <hr/>}
        <div className="">
            {writingReply && <div className="mt-1 mb-2 ml-2">
                {startsOpen ? <CommentEditor onSubmit={handleNewComment}/> : 
                    <CommentEditor onSubmit={handleNewComment} onCancel={handleCancelComment}/>
                }
            </div>}
            {viewComments && <div className="ml-2">
                <CommentSection comments={updatedComments}/>
            </div>}
        </div>
    </div>
}