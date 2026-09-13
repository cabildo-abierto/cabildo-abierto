import type {TopicBlock} from "@cabildo-abierto/api";
import {TopicBlockContent} from "@/components/topic-block-content";
import {TopicBlockTools} from "@/components/topic-block-tools";

export function TopicBlockView({topicId, block, openInPage = false, commentsOpen, onCommentsOpenChange}: {
    topicId: string;
    block: TopicBlock;
    commentsOpen?: boolean;
    onCommentsOpenChange?: (open: boolean) => void;
    openInPage?: boolean;
}) {
    return <div className="group/block relative">
        <article className="py-2"><TopicBlockContent block={block}/></article>
        <TopicBlockTools topicId={topicId} block={block} openInPage={openInPage} commentsOpen={commentsOpen} onCommentsOpenChange={onCommentsOpenChange}/>
    </div>;
}

export {TopicBlockContent};
