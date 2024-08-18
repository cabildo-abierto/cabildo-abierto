import { ContentProps } from "@/app/lib/definitions"
import { ContentWithComments } from "@/components/content-with-comments"

type CommentSectionProps = {
    parentContent: ContentProps,
    activeIDs?: string[]
}

const CommentSection: React.FC<CommentSectionProps> = ({parentContent, activeIDs}) => {

    function inActiveIDs({id}: {id: string}) {
        return (!activeIDs || activeIDs.length == 0) || activeIDs.includes(id)
    }
    
    return <>
        {parentContent.childrenComments.filter(inActiveIDs).map(({id}) => (
            <div className="py-1" key={id}>
                <ContentWithComments contentId={id}/>
            </div>
        ))}
    </>
}

export default CommentSection