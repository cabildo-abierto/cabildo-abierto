"use client"
import CommentSection from "./comment-section"
import ContentComponent from "./content"
import { useEffect, useState } from "react"
import { createComment } from "@/actions/create-content"
import dynamic from "next/dynamic"
import { ContentProps, getContentById } from "@/actions/get-content"
import { useUser } from "./user-provider"
import { ErrorPage } from "./error-page"
import { getContentsMap } from "./update-context"


const CommentEditor = dynamic( () => import( '@/components/editor/comment-editor' ), { ssr: false } );


type ContentWithCommentsProps = {
    content: ContentProps,
    entity?: any,
    isPostPage?: boolean
}


export function getListOfComments(contents: Record<string, ContentProps>, content: ContentProps){
    const comments: ContentProps[] = []
    content.childrenComments.forEach((comment) => {
        comments.push(contents[comment.id])
    })
    return comments
}


export const ContentWithComments: React.FC<ContentWithCommentsProps> = ({content, entity=null, isPostPage=false}) => {
    const startsOpen = (content && content.type == "Post" && isPostPage) || entity
    const [viewComments, setViewComments] = useState(startsOpen) 
    const [writingReply, setWritingReply] = useState(startsOpen)
    const [comments, setComments] = useState<ContentProps[]>([])

    const {user} = useUser()

    const fetchComments = async () => {
        const contents = await getContentsMap()
        const newContent: ContentProps | null = await getContentById(content.id)
        if(newContent){
            const newComments = getListOfComments(contents, newContent)
            setComments(newComments)
        }
    }

    useEffect(() => {
        if(viewComments){
            fetchComments()
        }
    }, [viewComments])

    const handleNewComment = async (text: string) => {
        if(user){
            // const mock = mockComment(new Date(), text, {id: user.id, name: user.name})
            await createComment(text, content.id, user.id).then(async () => {
                await fetchComments().then(() => {
                    setViewComments(true)
                    setWritingReply(startsOpen)
                })
            })
        }
    }

    const handleCancelComment = () => {
        setWritingReply(false)
    }

    return <div>
        <ContentComponent
            content={content}
            onViewComments={() => {setViewComments(!viewComments)}}
            onStartReply={() => {setWritingReply(!writingReply)}}
            entity={entity}
            isPostPage={isPostPage}
            viewingComments={viewComments}
        />
        <div className="">
            {writingReply && <div className="mt-1 mb-2 ml-2">
                {startsOpen ? <CommentEditor onSubmit={handleNewComment}/> : 
                    <CommentEditor onSubmit={handleNewComment} onCancel={handleCancelComment}/>
                }
            </div>}
            {(viewComments) && <div className="ml-2">
                <CommentSection comments={comments}/>
            </div>}
        </div>
    </div>
}