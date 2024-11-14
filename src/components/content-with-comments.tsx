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
import { CommentSectionCommentEditor } from "./comment-section-comment-editor"


type ContentWithCommentsProps = {
    content: ContentProps,
    isMainPage?: boolean,
    showingChanges?: boolean
    editing?: boolean
    showingAuthors?: boolean
    setEditing?: (arg0: boolean) => void
    parentContentId?: string
    inCommentSection: boolean
    depth?: number
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
    depth,
    setEditing}) => {

    const isEntity = content.type == "EntityContent"
    const startsOpen = isMainPage && !editing
    const [viewComments, setViewComments] = useState(startsOpen) 
    const [writingReply, setWritingReply] = useState(startsOpen && ["Post", "EntityContent"].includes(content.type))
    const [comments, setComments] = useState(content.childrenContents)
    
    useEffect(() => {
        if(content){
            for(let i = 0; i < content.childrenContents.length; i++){
                preload("/api/content/"+content.childrenContents[i].id, fetcher)
            }
            if(!comments || content.childrenContents.length == comments.length){
                setComments(content.childrenContents)
            }
        }
    }, [content])

    const depthParity = depth % 2 == 1

    const className = "w-full " + (depthParity ? "bg-[var(--content2)]" : "bg-[var(--content)]") +
        (isMainPage ? "" : " rounded") + (content.type == "Post" && !isMainPage ? " hover:bg-[var(--secondary-light)]" : "") + ((depth == 0 && !isMainPage) ? " border-b-2 border-r-2" : "") + (isMainPage ? "" : " border")

    const depthComments = ["Post", "EntityContent"].includes(content.type) ? depth : depth+1

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
            depth={depth}
        />
        {isMainPage && ["Post", "EntityContent"].includes(content.type) && !editing && <hr className="mt-12 mb-2" id="discussion-start"/>}
        <div className={isMainPage ? "" : "ml-2 mr-1"}>
            {writingReply && <CommentSectionCommentEditor
                content={content}
                comments={comments}
                setComments={setComments}
                setViewComments={setViewComments}
                setWritingReply={setWritingReply}
                startsOpen={startsOpen}
                depth={depthComments}
            />}
            {viewComments &&  
            (!isEntity ? <CommentSection
                content={content}
                comments={comments}
                writingReply={writingReply}
                depth={depthComments}
            /> : 
            <EntityCommentSection
                content={content}
                comments={comments}
                writingReply={writingReply}
                depth={depthComments}
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
    depth?: number
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
    depth=0,
    setEditing}: ContentWithCommentsFromIdProps) => {

    const content = useContent(contentId)
    if(content.isLoading) return <LoadingSpinner/>
    
    if(!content.content || content.isError) {
        return <></>
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
        depth={depth}
    />
}