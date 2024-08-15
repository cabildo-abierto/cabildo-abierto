import { ContentProps } from "@/actions/get-content";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { NodeKey } from "lexical";
import { useEffect, useMemo, useState } from "react";
import useModal from "../../hooks/useModal";
import CommentSection from "@/components/comment-section";
import { UserProps } from "@/actions/get-user";


function getTextComments(parentContent: ContentProps, contents: Record<string, ContentProps>){
    const commentIds = parentContent.childrenComments.filter((commentId) => {
        return true
    })

    const comments = commentIds.map(({id}) => contents[id])

    return comments
}


export function CommentsPanel({
    parentContent,
    contents,
    markNodeMap,
    user
}: {
    parentContent: ContentProps,
    contents: Record<string, ContentProps>;
    markNodeMap: Map<string, Set<NodeKey>>;
    user?: UserProps
}): JSX.Element {
    const comments = getTextComments(parentContent, contents)
    return <div className="comments-panel">
        <CommentSection
            comments={comments}
            contents={contents}
            user={user}
        />
    </div>
}