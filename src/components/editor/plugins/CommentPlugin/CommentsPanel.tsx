import { NodeKey } from "lexical";
import { ContentProps } from "../../../../app/lib/definitions";
import { EntitySidebarCommentSection, SidebarCommentSection } from "../../../comment-section";

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
        {parentContent.type == "EntityContent" ? <EntitySidebarCommentSection
            content={parentContent}
            activeIDs={activeIDs}
        /> : 
        <SidebarCommentSection
            content={parentContent}
            activeIDs={activeIDs}
        />
        }
    </div>
}