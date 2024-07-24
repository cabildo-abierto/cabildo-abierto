"use client"
import CommentSection from "./comment-section"
import ContentComponent from "./content"
import { useState } from "react"
import { createComment } from "@/actions/create-content"
import dynamic from "next/dynamic"
import { AuthorProps, ContentAndChildrenProps, ContentProps } from "@/actions/get-content"
import { useUser } from "./user-provider"
import { useContents } from "./use-contents"
import { ErrorPage } from "./error-page"

const CommentEditor = dynamic( () => import( '@/components/editor/comment-editor' ), { ssr: false } );

function mockComment(createdAt: Date, text: string, author: AuthorProps): ContentProps {
    return {
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
    }
}

type ContentWithCommentsProps = {
    content?: ContentProps,
    entity?: any,
    isPostPage?: boolean
}

function getListOfComments(contents: Record<string, ContentProps>, content: ContentProps){
    const comments: ContentProps[] = []
    content.childrenComments.forEach((comment) => {
        comments.push(contents[comment.id])
    })
    return comments
}

export const ContentWithComments: React.FC<ContentWithCommentsProps> = ({content=null, entity=null, isPostPage=false}) => {
    const {contents, setContents} = useContents()
    const startsOpen = (content && content.type == "Post" && isPostPage) || entity
    const [viewComments, setViewComments] = useState(startsOpen) 
    const [writingReply, setWritingReply] = useState(startsOpen)
    const comments = (content != null && contents != null) ? getListOfComments(contents, content) : null
    const [updatedComments, setUpdatedComments] = useState<ContentProps[] | null>(comments)
    const {user} = useUser()

    if(contents && !content){
        if(entity){
            content = contents[entity.contentId]
            if(updatedComments == null)
                setUpdatedComments(getListOfComments(contents, content))
        } else {
            return <ErrorPage>Ocurrió un error al cargar la entidad</ErrorPage>
        }
    } else {
        if(!content){
            return <>Cargando...</>
        }    
    }

    const handleNewComment = async (text: string) => {
        if(user && updatedComments){
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
            {(viewComments && updatedComments) && <div className="ml-2">
                <CommentSection comments={updatedComments}/>
            </div>}
        </div>
    </div>
}