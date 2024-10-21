"use client"
import { CommentSection, EntityCommentSection } from "./comment-section"
import { useEffect, useState } from "react"
import { preload, useSWRConfig } from "swr"
import LoadingSpinner from "./loading-spinner"
import ContentComponent from "./content"
import CommentEditor from "./editor/comment-editor"
import { CommentProps, ContentProps } from "../app/lib/definitions"
import { useUser } from "../app/hooks/user"
import { useContent } from "../app/hooks/contents"
import { createComment } from "../actions/contents"
import { fetcher } from "../app/hooks/utils"
import { compress } from "./compression"


type ContentWithCommentsProps = {
    content: ContentProps,
    isMainPage?: boolean,
    showingChanges?: boolean
    editing?: boolean
    showingAuthors?: boolean
    setEditing?: (arg0: boolean) => void
    parentContentId?: string
    inCommentSection: boolean
    depthParity?: boolean
    inItsOwnCommentSection: boolean
}


export const ContentWithComments: React.FC<ContentWithCommentsProps> = ({
    content,
    isMainPage=false,
    showingChanges=false,
    showingAuthors=false,
    editing=false,
    parentContentId,
    inCommentSection,
    inItsOwnCommentSection,
    depthParity=false,
    setEditing}) => {

    const {mutate} = useSWRConfig()
    const user = useUser()
    const isEntity = content.type == "EntityContent"
    const startsOpen = isMainPage && !editing
    const [viewComments, setViewComments] = useState(startsOpen) 
    const [writingReply, setWritingReply] = useState(startsOpen && ["Post", "EntityContent"].includes(content.type))
    const [comments, setComments] = useState(content.childrenContents)
    
    useEffect(() => {
        for(let i = 0; i < content.childrenContents.length; i++){
            preload("/api/content/"+content.childrenContents[i].id, fetcher)
        }
        if(!comments || content.childrenContents.length == comments.length){
            setComments(content.childrenContents)
        }
    }, [content])

    const handleNewComment = async (text: string) => {
        const compressedText = compress(text)
        const {error, ...newComment} = await createComment(compressedText, user.user.id, content.id, content.parentEntityId)
        if(error) return {error}

        setComments([newComment as CommentProps, ...comments])

        mutate("/api/replies-feed/"+user.user.id)
        setViewComments(true)

        // para que se resetee el contenido del editor
        setWritingReply(false)
        setWritingReply(startsOpen)
        return {}
    }

    const handleCancelComment = () => {
        setWritingReply(false)
    }
    
    const className = "w-full " + (depthParity ? "bg-[var(--secondary-light)]" : "bg-[var(--background)]") +
        (isMainPage ? "" : " content-container rounded") + (content.type == "Post" && !isMainPage ? " hover:bg-[var(--secondary-light)]" : "")

    const depthParityComments = ["Post", "EntityContent"].includes(content.type) ? false : !depthParity

    return <div className={className}>
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
            inItsOwnCommentSection={inItsOwnCommentSection}
            depthParity={depthParity}
        />
        {isMainPage && ["Post", "EntityContent"].includes(content.type) && !editing && <hr className="mt-12 mb-2" id="discussion-start"/>}
        <div className={isMainPage ? "" : "ml-2 mr-1"}>
            {writingReply && <div className={"mb-1 " + (depthParityComments ? "bg-[var(--secondary-light)]" : "bg-[var(--background)]")}>
                {startsOpen ? <CommentEditor
                        onSubmit={handleNewComment}
                    /> : 
                    <CommentEditor
                        onSubmit={handleNewComment}
                        onCancel={handleCancelComment}
                    />
                }
            </div>}
            {viewComments &&  
            (!isEntity ? <CommentSection
                content={content}
                comments={comments}
                writingReply={writingReply}
                depthParity={depthParityComments}
            /> : 
            <EntityCommentSection
                content={content}
                comments={comments}
                writingReply={writingReply}
                depthParity={depthParityComments}
            />
            )}
        </div>
    </div>
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
    inItsOwnCommentSection?: boolean
    depthParity?: boolean
}


export const ContentWithCommentsFromId = ({
    contentId,
    isMainPage=false,
    showingChanges=false,
    showingAuthors=false,
    editing=false,
    parentContentId,
    inCommentSection=false,
    inItsOwnCommentSection=false,
    depthParity=false,
    setEditing}: ContentWithCommentsFromIdProps) => {

    const content = useContent(contentId)
    if(content.isLoading) return <LoadingSpinner/>
    
    if(!content.content || content.isError) {
        return <>No se pudo cargar el contenido</>
    }

    return <ContentWithComments
        content={content.content}
        isMainPage={isMainPage}
        showingChanges={showingChanges}
        showingAuthors={showingAuthors}
        editing={editing}
        setEditing={setEditing}
        inCommentSection={inCommentSection}
        inItsOwnCommentSection={inItsOwnCommentSection}
        parentContentId={parentContentId}
        depthParity={depthParity}
    />
}