import { NodeKey } from "lexical";
import CommentSection from "src/components/comment-section";
import { ContentProps } from "src/app/lib/definitions";


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
            parentContentId={parentContent.id}
            activeIDs={activeIDs}
        />
    </div>
}