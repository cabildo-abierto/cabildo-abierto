"use client"
import CommentSection from "./comment-section"
import ContentComponent from "./content"
import { useState } from "react"
import { createComment } from "@/actions/create-content"
import dynamic from "next/dynamic"
import { useContent } from "@/app/hooks/contents"
import { useUser } from "@/app/hooks/user"
import { useSWRConfig } from "swr"
import LoadingSpinner from "./loading-spinner"


const CommentEditor = dynamic( () => import( '@/components/editor/comment-editor' ), { ssr: false } );


type ContentWithCommentsProps = {
    contentId: string,
    entity?: any,
    isPostPage?: boolean
}


export const ContentWithComments: React.FC<ContentWithCommentsProps> = ({
    contentId, entity=null, isPostPage=false}) => {
    const {content, isLoading, isError} = useContent(contentId)
    const { mutate } = useSWRConfig()

    const user = useUser()
    const startsOpen = isPostPage || entity
    const [viewComments, setViewComments] = useState(startsOpen) 
    const [writingReply, setWritingReply] = useState(startsOpen)
    
    const handleNewComment = async (text: string) => {
        if(user.user){
            await createComment(text, content.id, user.user.id)
            setViewComments(true)

            // para que se resetee el editor
            setWritingReply(false)
            setWritingReply(startsOpen)

            await mutate("/api/content/"+content.id)
            await mutate("/api/user/"+user.user.id)
        }
    }

    if(isLoading || user.isLoading){
        return <LoadingSpinner/>
    }

    if(isError || !content){
        return <></>
    }

    const handleCancelComment = () => {
        setWritingReply(false)
    }

    const isMainPage = isPostPage || entity

    return <>
        <ContentComponent
            contentId={contentId}
            onViewComments={() => {setViewComments(!viewComments)}}
            entity={entity}
            isPostPage={isPostPage}
            viewingComments={viewComments}
            onStartReply={() => {setWritingReply(!writingReply)}}
        />
        {isMainPage && <hr className="mt-12"/>}
        <div className={isMainPage ? "" : "ml-2"}>
            {writingReply && <div className="py-1">
                {startsOpen ? <CommentEditor onSubmit={handleNewComment}/> : 
                    <CommentEditor onSubmit={handleNewComment} onCancel={handleCancelComment}/>
                }
            </div>}
            {viewComments && <div>
                <CommentSection parentContent={content} otherContents={entity ? entity.referencedBy : undefined}/>
            </div>}
        </div>
    </>
}