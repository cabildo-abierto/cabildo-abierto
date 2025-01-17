"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation";
import { currentVersion, inRange } from "../utils";
import NoEntityPage from "../no-entity-page";
import { ArticleDiscussion } from "./article-discussion";
import { EntityCategoriesSmall } from "../entity-categories-small";
import {useTopic} from "../../hooks/topics";
import {getTopicTitle} from "./utils";
import {TopicContent} from "./topic-content";
import LoadingSpinner from "../loading-spinner";


export const TopicPage = ({topicId, paramsVersion, changes}: {
    topicId: string,
    paramsVersion?: number,
    changes?: boolean
}) => {
    const topic = useTopic(topicId)
    const initialSelection = changes ? "changes" : (paramsVersion == undefined ? "none" : "history")
    const [selectedPanel, setSelectedPanel] = useState(initialSelection)
    const searchParams = useSearchParams()

    useEffect(() => {
        setSelectedPanel(changes ? "changes" : (paramsVersion == undefined ? "none" : "history"))
    }, [searchParams])

    /*useEffect(() => {
        if(topic.topic){
            const references = topic.topic.versions[currentVersion(topic.topic)].references
            for(let i = 0; i < references.length; i++){
                preload("/api/entity/"+references[i].entityReferenced.id, fetcher)
            }
        }
    }, [entity])*/

    if(topic.isLoading){
        return <LoadingSpinner/>
    }

    if(!topic.topic || topic.isError || topic.error){
        return <NoEntityPage id={topicId}/>
    }

    const versions = topic.topic.versions
    const currentIndex = currentVersion(topic.topic)
    let version = paramsVersion
    if(paramsVersion == undefined || !inRange(paramsVersion, versions.length)){
        version = currentIndex
    }

    const titleFontSize = getTopicTitle(topic.topic).length > 60 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"

    return <div className="flex flex-col items-center w-full">
        <div className="flex flex-col border-b p-4 w-full">
            <div className="text-[var(--text-light)] text-sm mb-2">
                Tema
            </div>
            <h1 className={"mb-2 " + titleFontSize}>
                {getTopicTitle(topic.topic)}
            </h1>
            <EntityCategoriesSmall topic={topic.topic} route={[]}/>
        </div>
        <TopicContent topic={topic.topic} version={version} selectedPanel={selectedPanel} setSelectedPanel={setSelectedPanel}/>

        {selectedPanel != "editing" && <div className="w-full" id="discussion-start">
            <ArticleDiscussion
                topic={topic.topic}
                version={version}
            />
        </div>}
    </div>
}
