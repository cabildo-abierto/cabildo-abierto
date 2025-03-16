"use client"

import { topicUrl } from "../utils/utils"
import { fetcher } from "../../hooks/utils"
import { preload } from "swr"
import { DateSince } from "../ui-utils/date"
import {getTopicCategories, getTopicTitle} from "./utils";
import {SmallTopicProps} from "../../app/lib/definitions";
import {TopicCategories} from "./topic-categories";
import {useRouter} from "next/navigation";
import {People} from "@mui/icons-material";


const DateLastEdit = ({date}: {date: Date}) => {
  const className = "text-[var(--text-light)]"

  return <div className={className}>
    Última edición <DateSince date={date}/>
  </div>
}


export const TopicSearchResult: React.FC<{topic: SmallTopicProps}> = ({ topic }) => {
    const router = useRouter()

    function onMouseEnter(){
        preload("/api/topic/"+topic.id, fetcher)
    }
  
    return (
        <div className="relative flex flex-col w-full border-b">
            <div
                onClick={() => {router.push(topicUrl(topic.id))}}
                className={"p-6 w-full flex justify-between hover:bg-[var(--background-dark)] bg-[var(--background)] cursor-pointer"}
                onMouseEnter={onMouseEnter}
            >
                <div className={"max-w-[70%] flex flex-col space-y-2"}>
                    <div className="font-semibold mb-1">
                        {getTopicTitle(topic)}
                    </div>

                    <div className={"flex space-x-2 items-center text-sm mt-1"}>
                        {topic.lastEdit && <DateLastEdit date={topic.lastEdit}/>}
                    </div>
                </div>

                <div className={"flex flex-col items-end space-y-2 min-w-[30%]"}>
                    <TopicCategories
                        containerClassName={"justify-end text-xs"}
                        categories={getTopicCategories(topic)}
                    />
                    {topic.popularityScore != null && <div className={"text-[var(--text-light)] text-sm flex items-center"}>
                        <div>{topic.popularityScore}</div> <People fontSize={"inherit"}/>
                    </div>}
                </div>


            </div>
        </div>
    );
}
