import { useEntity } from "../app/hooks/entities"
import { CommentProps, ContentProps, EntityProps, SmallContentProps } from "../app/lib/definitions"
import { getAllQuoteIds } from "./comment"
import { decompress } from "./compression"
import { ContentWithCommentsFromId } from "./content-with-comments"
import LoadingSpinner from "./loading-spinner"
import { listOrder } from "./utils"


function commentScore(comment: {type: string, createdAt: Date | string}): number[]{

    const typeScores = {
        "FakeNewsReport": -5,
        "Comment": -4,
        "Post": -4,
        "FastPost": -4,
        "EntityContent": -3
    }


    return [typeScores[comment.type] ? typeScores[comment.type] : 0, -new Date(comment.createdAt).getTime()]
}

export function getEntityComments(entity: EntityProps, comments: CommentProps[]){
    for(let i = 0; i < entity.versions.length; i++){
        comments = [...comments, ...entity.versions[i].childrenContents]
    }
    
    const ids = new Set()
    let uniqueComments = []
    for(let i = 0; i < comments.length; i++){
        if(ids.has(comments[i].id)) continue
        ids.add(comments[i].id)
        uniqueComments.push(comments[i])
    }

    let references = [...entity.referencedBy, ...entity.weakReferences]
    let seenIds = new Set()
    let uniqueReferences = []
    references.forEach((r) => {
        if(!seenIds.has(r.id)){
            uniqueReferences.push(r)
            seenIds.add(r.id)
        }
    })

    uniqueComments = uniqueComments.map((c) => ({...c, isReference: false}))
    uniqueReferences = uniqueReferences.map((ref) => ({...ref, isReference: true}))

    return [...uniqueComments, ...uniqueReferences]
}

export const SidebarCommentSection = ({content, entity, activeIDs, comments}: {
    content: ContentProps, entity?: EntityProps, activeIDs: string[], comments: CommentProps[]}) => {

    function inActiveIDs({id}: {id: string}) {
        return (!activeIDs || activeIDs.length == 0) || activeIDs.includes(id)
    }

    let allIds: string[] = []
    try {
        let parentText = JSON.parse(decompress(content.compressedText))
        allIds = getAllQuoteIds(parentText.root)
    } catch {}
    
    const originalComments = entity ? getEntityComments(entity, []) : content.childrenContents
    const newComments = comments.filter((c) => (!originalComments.some(({id}) => (id == c.id))))

    const filteredComments = originalComments.filter(({id}) => ((allIds.includes(id) && inActiveIDs({id}))))

    for(let i = 0; i < newComments.length; i++){
        if(!filteredComments.some(({id}) => (newComments[i].id == id)) && inActiveIDs({id: newComments[i].id})){
            filteredComments.push(newComments[i])
        }
    }

    let contentsWithScore = filteredComments.map((comment) => ({comment: comment, score: commentScore(comment)}))
    contentsWithScore = contentsWithScore.sort(listOrder)

    return <>
        {
        contentsWithScore.length > 0 && 
        <div className="space-y-2 mt-2">
            {contentsWithScore.map(({comment}) => (
                <div key={comment.id}>
                    <ContentWithCommentsFromId
                        contentId={comment.id}
                        isMainPage={false}
                        parentContentId={content.id}
                        inCommentSection={true}
                        inItsOwnCommentSection={!comment.isReference}
                    />
                </div>
            ))}
        </div>
        }
        {contentsWithScore.length == 0 && <div className="text-center text-gray-800 py-2">
            Ningún comentario todavía.
        </div>}
    </>
}

export const EntitySidebarCommentSection = ({content, activeIDs, comments}: {
    content: ContentProps, activeIDs: string[], comments: CommentProps[]}) => {
    
    const entity = useEntity(content.parentEntityId)
    if(entity.isLoading){
        return <LoadingSpinner/>
    }

    return <SidebarCommentSection
        content={content}
        entity={entity.entity}
        activeIDs={activeIDs}
        comments={comments}
    />
}

type CommentSectionProps = {
    content: ContentProps
    comments: CommentProps[]
    entity?: EntityProps
    activeIDs?: string[]
    onlyQuotes?: boolean
    writingReply: boolean
    depthParity?: boolean
}

type CommentSectionElementProps = {
    id: string
    type: string
    createdAt: string | Date
    _count: {childrenTree: number}
    currentVersionOf?: {id: string}
    isReference: boolean
}

export const CommentSection: React.FC<CommentSectionProps> = ({
    content, comments, entity, writingReply, depthParity=false}) => {
    
    if(!comments) return <></>

    let feed: CommentSectionElementProps[] = entity ? 
        getEntityComments(entity, comments) : 
        comments.map((c) => ({...c, isReference: false}))

    if(entity){
        feed = feed.filter((comment) => {
            return comment.type != "EntityContent" || (comment.currentVersionOf && comment.currentVersionOf.id)
        })
    }

    let contentsWithScore = feed.map((comment) => ({comment: comment, score: commentScore(comment)}))
    contentsWithScore = contentsWithScore.sort(listOrder)
    

    return <>
        {
        contentsWithScore.length > 0 && 
        <div className={"space-y-2 pt-1 mb-1"} id="comment-section">
            {contentsWithScore.map(({comment}, index) => {
                const isRef = entity && entity.referencedBy.some((content) => (content.id == comment.id))
                return <div key={comment.id+index}>
                    <ContentWithCommentsFromId
                        contentId={comment.id}
                        isMainPage={false}
                        parentContentId={content.id}
                        inCommentSection={true}
                        inItsOwnCommentSection={!isRef && !comment.isReference}
                        depthParity={depthParity}
                    />
                </div>
            })}
        </div>
        }
        {(contentsWithScore.length == 0 && !writingReply) && <div className="text-center text-[var(--text-light)] py-2">
            Ningún comentario todavía.
        </div>}
    </>
}


type EntityCommentSectionProps = {
    content: ContentProps
    comments: CommentProps[]
    writingReply: boolean
    depthParity?: boolean
}


export const EntityCommentSection = ({content, comments, writingReply, depthParity}: EntityCommentSectionProps) => {
    const entity = useEntity(content.parentEntityId)
    if(entity.isLoading){
        return <LoadingSpinner/>
    }

    return <CommentSection
        content={content}
        comments={comments}
        writingReply={writingReply}
        entity={entity.entity}
        depthParity={depthParity}
    />
}