import { ContentProps } from "@/actions/get-content"
import ContentComponent from "@/components/content"


const CommentSection: React.FC<{comments: ContentProps[]}> = ({comments}) => {
    return <div className="border-t">
        {comments.map((content) => (
            <div className="" key={content.id}>
                <ContentComponent content={content} isMainContent={false}/>
            </div>
        ))}
    </div>
}

export default CommentSection