"use client";

import {useTopicRoute} from "@/components/topic-route-provider";
import {TopicTitleEditsHeader} from "@/components/topic-title-edits-header";
import {TopicTitleEditsList} from "@/components/topic-title-edits-list";
import {useTopicConnections} from "@/hooks/use-topic-connections";

export default function TopicTitleEditsPage() {
    const topic = useTopicRoute();
    useTopicConnections(topic.id, "reading");
    return <div className="mx-auto max-w-[682px] space-y-5 p-6">
        <TopicTitleEditsHeader/>
        <TopicTitleEditsList topicId={topic.id}/>
    </div>;
}
