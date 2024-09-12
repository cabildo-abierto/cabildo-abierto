import useSWR from "swr"
import { useEntity } from "../app/hooks/entities"
import { fetcher } from "../app/hooks/utils"
import { ContentProps, EntityProps, SmallContentProps } from "../app/lib/definitions"
import { getAllQuoteIds } from "./comment"
import { ContentWithCommentsFromId } from "./content-with-comments"
import LoadingSpinner from "./loading-spinner"


type CommentSectionProps = {
    content: ContentProps
    entity?: EntityProps
    activeIDs?: string[]
    otherContents?: SmallContentProps[]
    onlyQuotes?: boolean
    writingReply: boolean
    setWritingReply: (arg0: boolean) => void
}


/* En una sección de comentarios muestro: 
    Si es sidebar:
        Todos los comentarios hechos sobre el texto actual y solo sobre este contenido
    Si no:
        Todos los comentarios hechos sobre alguna versión del contenido. Eventualmente con una marca de a qué versión pertenecen
*/
export const CommentSection: React.FC<CommentSectionProps> = ({
    content, activeIDs, otherContents, writingReply, setWritingReply, onlyQuotes=false}) => {
    
    function inActiveIDs({id}: {id: string}) {
        return (!activeIDs || activeIDs.length == 0) || activeIDs.includes(id)
    }

    const parentEntityId = content.parentEntityId

    const commentsAPI = parentEntityId ? "/api/entity-comments/"+parentEntityId : "/api/comments/"+content.id
    const comments: {data: SmallContentProps[], mutate: any, isLoading: boolean} = useSWR(
        commentsAPI,
        fetcher
    )

    let allIds: string[] = []
    try {
        let parentText = JSON.parse(content.text)
        allIds = getAllQuoteIds(parentText.root)
    } catch {}
    
    if(comments.isLoading){
        return <LoadingSpinner/>
    }

    let filteredComments = null
    if(onlyQuotes){
        filteredComments = comments.data.filter(({id}) => (allIds.includes(id) && inActiveIDs({id})))
    } else {
        filteredComments = comments.data
    }

    const contents = otherContents ? filteredComments.concat(otherContents) : filteredComments
    

    function order(a: {score: number[]}, b: {score: number[]}){
        for(let i = 0; i < a.score.length; i++){
            if(a.score[i] > b.score[i]){
                return 1
            } else if(a.score[i] < b.score[i]){
                return -1
            }
        }
        return 0
    }

    function commentScore(comment: SmallContentProps): number[]{
        return [-Number(comment.type == "FakeNewsReport"), -new Date(comment.createdAt).getTime()]
    }

    let contentsWithScore = contents.map((comment) => ({comment: comment, score: commentScore(comment)}))
    contentsWithScore = contentsWithScore.sort(order)
    
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
        {(contentsWithScore.length == 0 && !writingReply) && <div className="text-center text-gray-800 py-2">
            No hay comentarios todavía.
        </div>}
    </>
}


type EntityCommentSectionProps = {
    content: ContentProps
    writingReply: boolean
    setWritingReply: (arg0: boolean) => void
}


export const EntityCommentSection = ({content, writingReply, setWritingReply}: EntityCommentSectionProps) => {
    const entity = useEntity(content.parentEntityId)
    if(entity.isLoading){
        return <LoadingSpinner/>
    }
    console.log("content", content)

    return <CommentSection
        content={content}
        writingReply={writingReply}
        setWritingReply={setWritingReply}
        otherContents={entity.entity.referencedBy}
    />
}