import type {TopicBlock} from "@cabildo-abierto/api";
import {TopicBlockContent} from "@/components/topic-block-content";
import {TopicBlockHistory} from "@/components/topic-block-history";

export function TopicBlockView({topicId, block}: {topicId: string; block: TopicBlock}) {
    return <div className="group/block relative">
        <article className="py-2"><TopicBlockContent block={block}/></article>
        <TopicBlockHistory topicId={topicId} block={block}/>
    </div>;
}

export {TopicBlockContent};
