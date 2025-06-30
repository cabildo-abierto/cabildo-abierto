"use client"

import {DateSince} from "../../../../modules/ui-utils/src/date"
import {getTopicCategories, getTopicTitle} from "./utils";
import TopicCategories from "./topic-categories";
import {useRouter} from "next/navigation";
import {topicUrl} from "@/utils/uri";
import {TopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {HandIcon, HandPalmIcon, UsersFourIcon, UsersIcon, UsersThreeIcon} from "@phosphor-icons/react";
import DescriptionOnHover from "../../../../modules/ui-utils/src/description-on-hover";
import TopicPopularity from "@/components/topics/topic/topic-popularity";


const DateLastEdit = ({date}: { date: Date }) => {

    return <div className={"text-[var(--text-light)] text-xs"}>
        Últ. edición hace <DateSince date={date}/>
    </div>
}


const TopicSearchResult = ({topic, index}: { topic: TopicViewBasic, index?: number }) => {
    const router = useRouter()

    function onMouseEnter() {
        // TO DO preload("/api/topic/"+topic.id, fetcher)
    }

    const categories = getTopicCategories(topic.props)

    return (
        <div
            onClick={() => {
                router.push(topicUrl(topic.id))
            }}
            className={"px-3 py-4 w-full flex justify-between hover:bg-[var(--background-dark)] bg-[var(--background)] cursor-pointer"}
            onMouseEnter={onMouseEnter}
        >
            <div className={"max-w-[70%] flex flex-col space-y-2"}>
                <div className={"flex space-x-1 items-center text-xs text-[var(--text-light)]"}>
                    {index != undefined ? <div className={""}>
                        {index + 1}
                    </div> : <div/>}
                    {categories && categories.length > 0 && <div>
                        -
                    </div>}
                    <TopicCategories
                        className={"text-[var(--text-light)]"}
                        containerClassName={"text-xs"}
                        categories={categories}
                    />
                </div>

                <div className="font-semibold mb-1">
                    {getTopicTitle(topic)}
                </div>

                {topic.popularity != null && <TopicPopularity count={topic.popularity[0]}/>}
            </div>

            <div className={"flex flex-col justify-between items-end space-y-2 min-w-[30%]"}>
                <div className={"flex space-x-2 items-center text-sm mt-1"}>
                    {topic.lastEdit && <DateLastEdit date={new Date(topic.lastEdit)}/>}
                </div>
            </div>
        </div>
    );
}


export default TopicSearchResult;