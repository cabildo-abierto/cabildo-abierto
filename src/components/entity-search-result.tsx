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


const DateLastEdit = ({topic}: {topic: {versions: {content: {record: {createdAt: Date}}}[]}}) => {
  const lastVersion = topic.versions[topic.versions.length-1]

  const className = "text-[var(--text-light)] px-1"

  if(topic.versions.length == 1){
    return <div className={className}>
      Creado <DateSince date={lastVersion.content.record.createdAt}/>
    </div>
  }

  return <div className={className}>
    Última edición <DateSince date={lastVersion.content.record.createdAt}/>
  </div>
}


export const EntitySearchResult: React.FC<{topic: SmallTopicProps}> = ({ topic }) => {

    function onMouseEnter(){
        preload("/api/topic/"+topic.id, fetcher)
    }

    const numWords = topic.versions[currentVersion(topic)].content.numWords
  
    return (
        <div className="relative flex flex-col w-full">
            {/*numWords == 0 && (
                <div className="absolute top-[-9px] right-2 z-10">
                    <span className="text-xs border px-1 text-[var(--text-light)] bg-[var(--background-dark)]">
                        ¡Tema sin información! Completalo
                    </span>
                </div>
            )*/}
            <Link
                href={articleUrl(topic.id)}
                className={"px-2 border-b hover:bg-[var(--background-dark)] bg-[var(--background)] " + (numWords == 0 ? "mt-1" : "")}
                onMouseEnter={onMouseEnter}
            >
                <div className="flex w-full items-center">
                    <div className="w-full">
                        <div className="w-full mt-1 mb-2 px-1">
                            <span className="text-[15px] font-semibold" style={{fontStretch: "normal"}}>
                                {getTopicTitle(topic)}
                            </span>
                        </div>

                        <TopicCategories topic={topic}/>

                        <div className={"flex justify-between items-center text-sm"}>
                            <div className="mt-1 mb-2">
                                <DateLastEdit topic={topic}/>
                            </div>
                            <div className={"text-[var(--text-light)]"}>
                                <PersonIcon fontSize={"inherit"}/> {topic.score[0]}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
