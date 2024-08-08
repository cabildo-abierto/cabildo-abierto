import { ContentProps } from "@/actions/get-content"
import { UserProps } from "@/actions/get-user"
import { ContentWithComments } from "@/components/content-with-comments"

type CommentSectionProps = {
    comments: ContentProps[], 
    contents: Record<string, ContentProps>,
    user: UserProps | null
}

const CommentSection: React.FC<CommentSectionProps> = ({comments, contents, user}) => {
    return <>
        {comments.map((comment: ContentProps) => (
            <div className="py-1" key={comment.id}>
                <ContentWithComments user={user} content={comment} contents={contents}/>
            </div>
        ))}
    </>
}

export default CommentSection