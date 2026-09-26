import type {TopicBlock} from "@cabildo-abierto/api";
import {TopicBlockContent} from "@/components/topic-block-content";
import {TopicBlockTools} from "@/components/topic-block-tools";

export function TopicBlockView({topicId, block, openInPage = false, footnoteNumbers, commentsOpen, onCommentsOpenChange, historyOpen, onHistoryOpenChange, onSectionOpen, sourcesOpen, onSourcesOpenChange}: {
    topicId: string;
    block: TopicBlock;
    sourcesOpen?: boolean;
    onSourcesOpenChange?: (open: boolean) => void;
    commentsOpen?: boolean;
    onCommentsOpenChange?: (open: boolean) => void;
    historyOpen?: boolean;
    onHistoryOpenChange?: (open: boolean) => void;
    onSectionOpen?: (section: "comments" | "history" | "sources") => void;
    openInPage?: boolean;
    footnoteNumbers?: ReadonlyMap<string, number>;
}) {
    return <div className="group/block relative">
        <article className="py-2"><TopicBlockContent block={block} footnoteNumbers={footnoteNumbers}/></article>
        <TopicBlockTools topicId={topicId} block={block} openInPage={openInPage}
            commentsOpen={commentsOpen} onCommentsOpenChange={onCommentsOpenChange}
            historyOpen={historyOpen} onHistoryOpenChange={onHistoryOpenChange} sourcesOpen={sourcesOpen} onSourcesOpenChange={onSourcesOpenChange} onSectionOpen={onSectionOpen}/>
    </div>;
}

export {TopicBlockContent};
