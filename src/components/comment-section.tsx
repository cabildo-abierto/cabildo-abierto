import { useEntity } from "../app/hooks/entities"
import { CommentProps, ContentProps, EntityProps, FeedContentProps, SmallContentProps } from "../app/lib/definitions"
import { getAllQuoteIds } from "./comment"
import { decompress } from "./compression"
import { ContentWithCommentsFromId } from "./content-with-comments"
import LoadingSpinner from "./loading-spinner"
import { popularityScore } from "./sorted-and-filtered-feed"
import { listOrder } from "./utils"


function commentScore(comment: {
    type: string
    createdAt: Date | string
    childrenTree: {authorId: string}[]
    author: {id: string}
    _count: {reactions: number}
    uniqueViewsCount: number
}): number[]{

    const typeScores = {
        "FakeNewsReport": -5,
        "Comment": -4,
        "Post": -4,
        "FastPost": -4,
        "EntityContent": -3
    }

    return [typeScores[comment.type] ? typeScores[comment.type] : 0, -popularityScore(comment)]
}

function removeRepetitions(a: any[], getKey: (v: any) => any = (v) => (v)){
    let keys = new Set()
    const unique = []
    a.forEach((v) => {
        const k = getKey(v)
        if(!keys.has(k)){
            keys.add(k)
            unique.push(v)
        }
    })
    return unique
}

export function getEntityComments(entity: EntityProps, comments: CommentProps[], addReferences: boolean){
    for(let i = 0; i < entity.versions.length; i++){
        if(entity.versions[i].type == "EntityContent"){
            comments = [...comments, ...entity.versions[i].childrenContents]
        }
    }

    let commentsAndRefs: CommentSectionElementProps[] = comments.map((c) => ({...c, isReference: false}))

    if(addReferences){
        let references: CommentSectionElementProps[] = [...entity.referencedBy, ...entity.weakReferences].map((ref) => ({...ref, isReference: true}))

        references = references.filter((r) => (r.id != entity.id && r.parentEntityId != entity.id))

        commentsAndRefs = [...commentsAndRefs, ...references]
    }

    return removeRepetitions(commentsAndRefs, (v) => (v.id))
}

export const SidebarCommentSection = ({content, entity, activeIDs, comments}: {
    content: {id: string, compressedText?: string, childrenContents: CommentProps[]}, entity?: EntityProps, activeIDs: string[], comments: CommentProps[]}) => {

    function inActiveIDs({id}: {id: string}) {
        return (!activeIDs || activeIDs.length == 0) || activeIDs.includes(id)
    }

    let allIds: string[] = []
    try {
        let parentText = JSON.parse(decompress(content.compressedText))
        allIds = getAllQuoteIds(parentText.root)
    } catch {}

    const originalComments: CommentSectionElementProps[] = entity ? getEntityComments(entity, [], false) : content.childrenContents.map((c) => ({...c, isReference: false}))
    const newComments: CommentSectionElementProps[] = comments.map((c) => ({...c, isReference: false})).filter((c) => (!originalComments.some(({id}) => (id == c.id))))

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
    content: {compressedText?: string, parentEntityId?: string, childrenContents: CommentProps[], id: string}, activeIDs: string[], comments: CommentProps[]}) => {
    
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

type CommentSectionElementProps = {
    id: string
    type: string
    createdAt: string | Date
    _count: {
        childrenTree: number
        reactions: number
    }
    currentVersionOf?: {id: string}
    isReference: boolean
    parentEntityId?: string
    childrenTree: {authorId: string}[]
    author: {id: string}
    uniqueViewsCount: number
}

type CommentSectionProps = {
    content: {
        id: string
    }
    comments: CommentProps[]
    entity?: EntityProps
    activeIDs?: string[]
    onlyQuotes?: boolean
    writingReply: boolean
    depth?: number
}

export const CommentSection: React.FC<CommentSectionProps> = ({
    content, comments, entity, writingReply, depth}) => {
    
    if(comments == undefined) return <></>

    let feed: CommentSectionElementProps[] = entity ? 
        getEntityComments(entity, comments, true) : 
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
                        depth={depth}
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
    content: {
        id: string
        parentEntityId?: string
    }
    comments: CommentProps[]
    writingReply: boolean
    depth: number
}


export const EntityCommentSection = ({content, comments, writingReply, depth}: EntityCommentSectionProps) => {
    const entity = useEntity(content.parentEntityId)
    if(entity.isLoading){
        return <LoadingSpinner/>
    }

    return <CommentSection
        content={content}
        comments={comments}
        writingReply={writingReply}
        entity={entity.entity}
        depth={depth}
    />
}