"use client"

import { CustomLink as Link } from './custom-link';
import { articleUrl, currentVersion } from "./utils"
import { fetcher } from "../hooks/utils"
import { preload } from "swr"
import { DateSince } from "./date"
import {getTopicTitle} from "./topic/utils";
import {SmallTopicProps} from "../app/lib/definitions";
import PersonIcon from "@mui/icons-material/Person";
import {TopicCategories} from "./entity-categories-small";
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

    const numWords = topic.versions[currentVersion(topic)].content.numWords
  
    return (
        <div className="relative flex flex-col w-full">
            <div
                onClick={() => {router.push(articleUrl(topic.id))}}
                className={"p-2 w-full hover:bg-[var(--background-dark)] bg-[var(--background)]"}
                onMouseEnter={onMouseEnter}

            >
                <div className="w-full text-[15px] font-semibold">
                    {getTopicTitle(topic)}
                </div>

                <TopicCategories topic={topic}/>

                <div className={"flex space-x-2 items-center text-sm"}>
                    <DateLastEdit topic={topic}/>
                    {topic.score && <div className={"text-[var(--text-light)] flex items-center"}>
                        <PersonIcon fontSize={"inherit"}/> {topic.score[0]}
                    </div>}
                </div>
            </div>
        </div>
    );
}
