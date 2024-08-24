import { useFeed } from "@/app/hooks/contents"
import { ContentProps } from "@/app/lib/definitions"
import { ContentWithComments } from "@/components/content-with-comments"

type CommentSectionProps = {
    parentContent: ContentProps,
    activeIDs?: string[],
    otherContents?: {id: string, createdAt: string}[]
}

const CommentSection: React.FC<CommentSectionProps> = ({parentContent, activeIDs, otherContents}) => {

    function inActiveIDs({id}: {id: string}) {
        return (!activeIDs || activeIDs.length == 0) || activeIDs.includes(id)
    }

    const comments: {id: string, createdAt: string}[] = parentContent.childrenContents.filter(inActiveIDs)

    const feed = useFeed()

    if(feed.isLoading){
        return <></>
    }

    const contents = otherContents ? comments.concat(otherContents) : comments

    function compDate(a: {createdAt: string}, b: {createdAt: string}){
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }

    return <>
        {contents.sort(compDate).map(({id}) => (
            <div className="" key={id}>
                <ContentWithComments contentId={id}/>
            </div>
        ))}
    </>
}

export default CommentSection