import { NodeKey } from "lexical";
import { ContentProps } from "../../../../app/lib/definitions";
import { CommentSection, EntitySidebarCommentSection, SidebarCommentSection } from "../../../comment-section";

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
        {parentContent.type == "EntityContent" ? <SidebarCommentSection
            content={parentContent}
            activeIDs={activeIDs}
        /> : 
        <EntitySidebarCommentSection
            content={parentContent}
            activeIDs={activeIDs}
        />
        }
    </div>
}