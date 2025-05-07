"use client"

import {DateSince} from "../../../../modules/ui-utils/src/date"
import {getTopicCategories, getTopicTitle} from "./utils";
import {TopicCategories} from "./topic-categories";
import {useRouter} from "next/navigation";
import {People} from "@mui/icons-material";
import {topicUrl} from "@/utils/uri";
import {TopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {PrettyJSON} from "../../../../modules/ui-utils/src/pretty-json";


const DateLastEdit = ({date}: { date: Date }) => {
    const className = "text-[var(--text-light)]"

    return <div className={className}>
        Última edición hace <DateSince date={date}/>
    </div>
}


export const TopicSearchResult = ({topic}: { topic: TopicViewBasic }) => {
    const router = useRouter()

    function onMouseEnter() {
        // TO DO preload("/api/topic/"+topic.id, fetcher)
    }

    return (
        <div
            onClick={() => {
                router.push(topicUrl(topic.id))
            }}
            className={"border-b min-[500px]:p-3 p-3 w-full flex justify-between hover:bg-[var(--background-dark)] bg-[var(--background)] cursor-pointer"}
            onMouseEnter={onMouseEnter}
        >
            <div className={"max-w-[70%] flex flex-col space-y-2"}>
                <div className="font-semibold mb-1">
                    {getTopicTitle(topic)}
                </div>

                <div className={"flex space-x-2 items-center text-sm mt-1"}>
                    {topic.lastEdit && <DateLastEdit date={new Date(topic.lastEdit)}/>}
                </div>
            </div>

            <div className={"flex flex-col items-end space-y-2 min-w-[30%]"}>
                <TopicCategories
                    containerClassName={"justify-end text-xs"}
                    categories={getTopicCategories(topic.props)}
                />
                {topic.popularity != null && <div className={"text-[var(--text-light)] text-sm flex items-center"}>
                    <div>{topic.popularity[0]}</div>
                    <People fontSize={"inherit"}/>
                </div>}
            </div>
        </div>
    );
}
