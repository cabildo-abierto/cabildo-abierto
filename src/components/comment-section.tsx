import { ContentProps } from "@/actions/get-content"
import { UserProps } from "@/actions/get-user"
import { ContentWithComments } from "@/components/content-with-comments"

type CommentSectionProps = {
    parentContent: ContentProps,
    user?: UserProps,
    activeIDs?: string[]
}

const CommentSection: React.FC<CommentSectionProps> = ({parentContent, activeIDs}) => {

    function inActiveIDs() {
        return !activeIDs || activeIDs.includes(parentContent.id)
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