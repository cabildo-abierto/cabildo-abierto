import type {TopicBlock} from "@cabildo-abierto/api";
import {TopicBlockContent} from "@/components/topic-block-content";
import {TopicBlockTools} from "@/components/topic-block-tools";

export function TopicBlockView({topicId, block, openInPage = false, commentsOpen, onCommentsOpenChange, historyOpen, onHistoryOpenChange, onSectionOpen}: {
    topicId: string;
    block: TopicBlock;
    commentsOpen?: boolean;
    onCommentsOpenChange?: (open: boolean) => void;
    historyOpen?: boolean;
    onHistoryOpenChange?: (open: boolean) => void;
    onSectionOpen?: (section: "comments" | "history") => void;
    openInPage?: boolean;
}) {
    return <div className="group/block relative">
        <article className="py-2"><TopicBlockContent block={block}/></article>
        <TopicBlockTools topicId={topicId} block={block} openInPage={openInPage}
            commentsOpen={commentsOpen} onCommentsOpenChange={onCommentsOpenChange}
            historyOpen={historyOpen} onHistoryOpenChange={onHistoryOpenChange} onSectionOpen={onSectionOpen}/>
    </div>;
}

export {TopicBlockContent};
