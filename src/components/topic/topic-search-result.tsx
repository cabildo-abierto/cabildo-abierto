"use client"

import { CustomLink as Link } from '../ui-utils/custom-link';
import { topicUrl, getCurrentVersion } from "../utils/utils"
import { fetcher } from "../../hooks/utils"
import { preload } from "swr"
import { DateSince } from "../ui-utils/date"
import {getTopicCategories, getTopicTitle} from "./utils";
import {SmallTopicProps} from "../../app/lib/definitions";
import PersonIcon from "@mui/icons-material/Person";
import {TopicCategories} from "./topic-categories";
import {useRouter} from "next/navigation";


const DateLastEdit = ({topic}: {topic: {versions: {content: {record: {createdAt: Date}}}[]}}) => {
  const lastVersion = topic.versions[topic.versions.length-1]

  const className = "text-[var(--text-light)]"

  if(topic.versions.length == 1){
    return <div className={className}>
      Creado <DateSince date={lastVersion.content.record.createdAt}/>
    </div>
  }

  return <div className={className}>
    Última edición <DateSince date={lastVersion.content.record.createdAt}/>
  </div>
}


export const TopicSearchResult: React.FC<{topic: SmallTopicProps}> = ({ topic }) => {
    const router = useRouter()

    function onMouseEnter(){
        preload("/api/topic/"+topic.id, fetcher)
    }
  
    return (
        <div className="relative flex flex-col w-full">
            <div
                onClick={() => {router.push(topicUrl(topic.id))}}
                className={"p-2 w-full hover:bg-[var(--background-dark)] bg-[var(--background)] cursor-pointer"}
                onMouseEnter={onMouseEnter}
            >
                <div className="w-full text-[15px] font-semibold mb-1">
                    {getTopicTitle(topic)}
                </div>

                <TopicCategories
                    categories={getTopicCategories(topic)}
                />

                <div className={"flex space-x-2 items-center text-sm mt-1"}>
                    {/*TO DO <DateLastEdit topic={topic}/>*/}
                    {topic.popularityScore != null && <div className={"text-[var(--text-light)] flex items-center"}>
                        <PersonIcon fontSize={"inherit"}/> {topic.popularityScore}
                    </div>}
                </div>
            </div>
        </div>
    );
}
