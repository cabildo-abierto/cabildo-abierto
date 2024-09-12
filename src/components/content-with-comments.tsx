"use client"
import { CommentSection, EntityCommentSection } from "./comment-section"
import { ReactNode, useEffect, useState } from "react"
import { preload, useSWRConfig } from "swr"
import LoadingSpinner from "./loading-spinner"
import ContentComponent from "./content"
import CommentEditor from "./editor/comment-editor"
import { ContentProps } from "../app/lib/definitions"
import { useUser } from "../app/hooks/user"
import { useContent } from "../app/hooks/contents"
import { createComment } from "../actions/contents"
import { fetcher } from "../app/hooks/utils"


type ContentWithCommentsProps = {
    content: ContentProps,
    isMainPage?: boolean,
    showingChanges?: boolean
    editing?: boolean
    showingAuthors?: boolean
    setEditing?: (arg0: boolean) => void
    parentContentId?: string
    inCommentSection: boolean
}

export const ContentWithComments: React.FC<ContentWithCommentsProps> = ({
    content,
    isMainPage=false,
    showingChanges=false,
    showingAuthors=false,
    editing=false,
    parentContentId,
    inCommentSection,
    setEditing}) => {
    
    const {mutate} = useSWRConfig()

    const user = useUser()
    const isEntity = content.type == "EntityContent"
    const startsOpen = isMainPage
    const [viewComments, setViewComments] = useState(startsOpen) 
    const [writingReply, setWritingReply] = useState(startsOpen && ["Post", "EntityContent"].includes(content.type))
    
    useEffect(() => {
        for(let i = 0; i < content.childrenContents.length; i++){
            preload("/api/content/"+content.childrenContents[i].id, fetcher)
        }
    }, [])

    const handleNewComment = async (text: string) => {
        if(user.user){
            await createComment(text, content.id, user.user.id)
            mutate("/api/comments/"+content.id)
            if(content.parentEntityId)
                mutate("/api/entity-comments/"+content.parentEntityId)
            mutate("/api/replies-feed/"+user.user.id)
            setViewComments(true)

            // para que se resetee el contenido del editor
            setWritingReply(false)
            setWritingReply(startsOpen)
        }
    }

    const handleCancelComment = () => {
        setWritingReply(false)
    }
    
    return <>
        <ContentComponent
            content={content}
            onViewComments={() => {setViewComments(!viewComments)}}
            isMainPage={isMainPage}
            viewingComments={viewComments}
            onStartReply={() => {setWritingReply(!writingReply)}}
            showingChanges={showingChanges}
            showingAuthors={showingAuthors}
            editing={editing}
            setEditing={setEditing}
            parentContentId={parentContentId}
            inCommentSection={inCommentSection}
        />
        {isMainPage && ["Post", "EntityContent"].includes(content.type) && <hr className="mt-12"/>}
        <div className={isMainPage ? "" : "ml-2"}>
            {writingReply && <div className="py-2">
                {startsOpen ? <CommentEditor onSubmit={handleNewComment}/> : 
                    <CommentEditor onSubmit={handleNewComment} onCancel={handleCancelComment}/>
                }
            </div>}
            {viewComments &&  
            (!isEntity ? <CommentSection
                content={content}
                setWritingReply={setWritingReply}
                writingReply={writingReply}
            /> : 
            <EntityCommentSection
                content={content}
                setWritingReply={setWritingReply}
                writingReply={writingReply}
            />
            )}
        </div>
    </>
}


type ContentWithCommentsFromIdProps = {
    contentId: string,
    isMainPage?: boolean,
    showingChanges?: boolean
    editing?: boolean
    showingAuthors?: boolean
    setEditing?: (arg0: boolean) => void
    parentContentId?: string
    inCommentSection?: boolean
}


export const ContentWithCommentsFromId = ({
    contentId,
    isMainPage=false,
    showingChanges=false,
    showingAuthors=false,
    editing=false,
    parentContentId,
    inCommentSection=false,
    setEditing}: ContentWithCommentsFromIdProps) => {

    const content = useContent(contentId)
    if(content.isLoading) return <LoadingSpinner/>
    if(!content.content) return <>Error :(</>

    return <ContentWithComments
        content={content.content}
        isMainPage={isMainPage}
        showingChanges={showingChanges}
        showingAuthors={showingAuthors}
        editing={editing}
        setEditing={setEditing}
        inCommentSection={inCommentSection}
        parentContentId={parentContentId}
    />
}