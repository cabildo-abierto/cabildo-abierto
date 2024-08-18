import { ContentProps } from "@/actions/get-content";
import { NodeKey } from "lexical";
import CommentSection from "@/components/comment-section";


function getTextComments(
    parentContent: ContentProps, 
    contents: Record<string, ContentProps>,
    activeIDs: string[]
){
    const commentIds = parentContent.childrenComments.filter(({id}) => {
        if(activeIDs.length > 0){
            return activeIDs.includes(id)
        } else {
            return true
        }
    })

    const comments = commentIds.map(({id}) => contents[id])

    return comments
}


export function CommentsPanel({
    activeIDs,
    parentContent,
    markNodeMap
}: {
    activeIDs: string[],
    parentContent: ContentProps,
    markNodeMap: Map<string, Set<NodeKey>>
}): JSX.Element {
    return <div className="comments-panel">
        <CommentSection
            parentContent={parentContent}
            activeIDs={activeIDs}
        />
    </div>
}