import { NodeKey } from "lexical";
import { ContentProps } from "../../../../app/lib/definitions";
import { CommentSection } from "../../../comment-section";

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
            content={parentContent}
            activeIDs={activeIDs}
            onlyQuotes={true}
            writingReply={false}
            setWritingReply={(arg0: boolean) => {}}
        />
    </div>
}