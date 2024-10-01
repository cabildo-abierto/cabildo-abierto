import { useEntity } from "../app/hooks/entities"
import { ContentProps, EntityProps, SmallContentProps } from "../app/lib/definitions"
import { getAllQuoteIds } from "./comment"
import { decompress } from "./compression"
import { ContentWithCommentsFromId } from "./content-with-comments"
import LoadingSpinner from "./loading-spinner"
import { listOrder } from "./utils"


function commentScore(comment: SmallContentProps): number[]{
    return [-Number(comment.type == "FakeNewsReport"), -new Date(comment.createdAt).getTime()]
}

function getEntityComments(entity: EntityProps){
    let comments = []
    for(let i = 0; i < entity.versions.length; i++){
        comments = [...comments, ...entity.versions[i].childrenContents]
    }
    return comments
}

export const SidebarCommentSection = ({content, entity, activeIDs}: {content: ContentProps, entity?: EntityProps, activeIDs: string[]}) => {
    function inActiveIDs({id}: {id: string}) {
        return (!activeIDs || activeIDs.length == 0) || activeIDs.includes(id)
    }

    let allIds: string[] = []
    try {
        let parentText = JSON.parse(decompress(content.compressedText))
        allIds = getAllQuoteIds(parentText.root)
    } catch {}
    
    const comments = entity ? getEntityComments(entity) : content.childrenContents
    const filteredComments = comments.filter(({id}) => (allIds.includes(id) && inActiveIDs({id})))

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

export const EntitySidebarCommentSection = ({content, activeIDs}: {content: ContentProps, activeIDs: string[]}) => {
    const entity = useEntity(content.parentEntityId)
    if(entity.isLoading){
        return <LoadingSpinner/>
    }

    return <SidebarCommentSection
        content={content}
        entity={entity.entity}
        activeIDs={activeIDs}
    />
}

type CommentSectionProps = {
    content: ContentProps
    entity?: EntityProps
    activeIDs?: string[]
    onlyQuotes?: boolean
    writingReply: boolean
    setWritingReply: (arg0: boolean) => void
    depthParity?: boolean
    padding?: boolean
}
/* En una sección de comentarios muestro: 
    Si es sidebar:
        Todos los comentarios hechos sobre el texto actual y solo sobre este contenido
    Si no:
        Todos los comentarios hechos sobre alguna versión del contenido. Eventualmente con una marca de a qué versión pertenecen
*/
export const CommentSection: React.FC<CommentSectionProps> = ({
    content, entity, writingReply, setWritingReply, depthParity=false, padding=true}) => {

    let comments = entity ? 
        [...getEntityComments(entity), ...entity.referencedBy] : 
        content.childrenContents

    if(entity){
        comments = comments.filter((comment) => {
            return comment.type != "EntityContent" || (comment.currentVersionOf && comment.currentVersionOf.id)
        })
    }

    let contentsWithScore = comments.map((comment) => ({comment: comment, score: commentScore(comment)}))
    contentsWithScore = contentsWithScore.sort(listOrder)

    return <>
        {
        contentsWithScore.length > 0 && 
        <div className={"space-y-2 pt-1 mb-1"}>
            {contentsWithScore.map(({comment}) => {
                const isRef = entity && entity.referencedBy.some((content) => (content.id == comment.id))

                return <div key={comment.id}>
                    <ContentWithCommentsFromId
                        contentId={comment.id}
                        isMainPage={false}
                        parentContentId={content.id}
                        inCommentSection={!isRef}
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
    writingReply: boolean
    setWritingReply: (arg0: boolean) => void
    depthParity?: boolean
}


export const EntityCommentSection = ({content, writingReply, setWritingReply, depthParity}: EntityCommentSectionProps) => {
    const entity = useEntity(content.parentEntityId)
    if(entity.isLoading){
        return <LoadingSpinner/>
    }

    return <CommentSection
        content={content}
        entity={entity.entity}
        writingReply={writingReply}
        setWritingReply={setWritingReply}
        depthParity={depthParity}
        padding={false}
    />
}