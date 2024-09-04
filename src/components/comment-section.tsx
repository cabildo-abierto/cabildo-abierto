import { ContentProps } from "src/app/lib/definitions"
import { ContentWithComments } from "src/components/content-with-comments"
import LoadingSpinner from "./loading-spinner"
import useSWR from "swr"
import { fetcher } from "src/app/hooks/utils"
import { SmallContentProps } from "src/app/api/feed/route"
import { getAllQuoteIds } from "./comment"

type CommentSectionProps = {
    content: ContentProps
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
const CommentSection: React.FC<CommentSectionProps> = ({
    content, activeIDs, otherContents, writingReply, setWritingReply, onlyQuotes=false}) => {
    
    console.log("otherContents", otherContents)
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
                    <ContentWithComments contentId={comment.id}/>
                </div>
            ))}
        </div>
        }
        {(contentsWithScore.length == 0 && !writingReply) && <div className="text-center text-gray-800 py-2">
            No hay comentarios todavía. <button className="hover:underline text-[var(--primary)]" onClick={() => {setWritingReply(true)}}>Agregá uno</button>.
        </div>}
    </>
}

export default CommentSection