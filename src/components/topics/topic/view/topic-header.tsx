import {getTopicCategories, getTopicTitle} from "@/components/topics/topic/utils";
import {TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import TopicCategories from "@/components/topics/topic/view/topic-categories";


export const TopicHeader = ({topic}: {
    topic: TopicView
}) => {

    return <div className="flex flex-col py-1 mb-2 w-full sm:space-y-2" id={"topic-header"}>
        <h1 className={"font-extrabold normal-case"}>
            {getTopicTitle(topic)}
        </h1>
        <TopicCategories
            className={"text-[var(--text-light)] font-light text-sm hover:bg-[var(--background-dark)]"}
            categories={getTopicCategories(topic.props)}
        />
    </div>
}