import { useFeed } from "src/app/hooks/contents"
import { ContentProps } from "src/app/lib/definitions"
import { ContentWithComments } from "src/components/content-with-comments"
import LoadingSpinner from "./loading-spinner"
import useSWR from "swr"
import { fetcher } from "src/app/hooks/utils"

type CommentSectionProps = {
    parentContentId: string,
    activeIDs?: string[],
    otherContents?: {id: string, createdAt: string, type: string}[]
}

const CommentSection: React.FC<CommentSectionProps> = ({parentContentId, activeIDs, otherContents}) => {

    function inActiveIDs({id}: {id: string}) {
        return (!activeIDs || activeIDs.length == 0) || activeIDs.includes(id)
    }

    const comments: {data: {id: string, createdAt: string, type: string}[], mutate: any, isLoading: boolean} = useSWR("/api/comments/"+parentContentId, fetcher)

    if(comments.isLoading){
        return <LoadingSpinner/>
    }

    let filteredComments = comments.data.filter(inActiveIDs)

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

    function commentScore(comment: {type: string, createdAt: string}): number[]{
        return [-Number(comment.type == "FakeNewsReport"), -new Date(comment.createdAt).getTime()]
    }

    let contentsWithScore = contents.map((comment) => ({comment: comment, score: commentScore(comment)}))
    contentsWithScore = contentsWithScore.sort(order)
    
    return <>
        {contentsWithScore.map(({comment}) => (
            <div key={comment.id}>
                <ContentWithComments contentId={comment.id}/>
            </div>
        ))}
    </>
}

export default CommentSection