"use client"

import {DateSince} from "../../../../modules/ui-utils/src/date"
import {getTopicCategories, getTopicTitle} from "./utils";
import TopicCategories from "./topic-categories";
import {useRouter} from "next/navigation";
import {People} from "@mui/icons-material";
import {topicUrl} from "@/utils/uri";
import {TopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {WriteButtonIcon} from "@/components/icons/write-button-icon";


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

    return (
        <div
            onClick={() => {
                router.push(topicUrl(topic.id))
            }}
            className={"px-3 py-4 w-full flex justify-between hover:bg-[var(--background-dark)] bg-[var(--background)] cursor-pointer"}
            onMouseEnter={onMouseEnter}
        >
            <div className={"max-w-[70%] flex flex-col space-y-2"}>
                <TopicCategories
                    className={"text-[var(--text-light)]"}
                    containerClassName={"text-xs"}
                    categories={getTopicCategories(topic.props)}
                />

                <div className="font-semibold mb-1">
                    {getTopicTitle(topic)}
                </div>

                {topic.popularity != null && <div className={"text-[var(--text-light)] text-sm flex items-center"}>
                    <div>{topic.popularity[0]} persona{topic.popularity[0] == 1 ? "" : "s"}.</div>
                </div>}
            </div>

            <div className={"flex flex-col justify-between items-end space-y-2 min-w-[30%]"}>
                {index != undefined ? <div className={"text-xs text-[var(--text-light)]"}>
                    {index+1}
                </div> : <div/>}
                <div className={"flex space-x-2 items-center text-sm mt-1"}>
                    {topic.lastEdit && <DateLastEdit date={new Date(topic.lastEdit)}/>}
                </div>
            </div>
        </div>
    );
}


export default TopicSearchResult;