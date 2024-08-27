import { useFeed } from "@/app/hooks/contents"
import { ContentProps } from "@/app/lib/definitions"
import { ContentWithComments } from "@/components/content-with-comments"
import LoadingSpinner from "./loading-spinner"

type CommentSectionProps = {
    parentContent: ContentProps,
    activeIDs?: string[],
    otherContents?: {id: string, createdAt: string, type: string}[]
}

const CommentSection: React.FC<CommentSectionProps> = ({parentContent, activeIDs, otherContents}) => {

    function inActiveIDs({id}: {id: string}) {
        return (!activeIDs || activeIDs.length == 0) || activeIDs.includes(id)
    }

    const comments: {id: string, createdAt: string, type: string}[] = parentContent.childrenContents.filter(inActiveIDs)

    const feed = useFeed()

    if(feed.isLoading){
        return <LoadingSpinner/>
    }

    const contents = otherContents ? comments.concat(otherContents) : comments

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
    console.log(contentsWithScore)
    return <>
        {contentsWithScore.map(({comment}) => (
            <div key={comment.id}>
                <ContentWithComments contentId={comment.id}/>
            </div>
        ))}
    </>
}

export default CommentSection