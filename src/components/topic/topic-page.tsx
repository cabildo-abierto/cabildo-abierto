"use client"
import { useEffect, useState } from "react"
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { preload, useSWRConfig } from "swr";
import { CustomLink as Link } from '../custom-link';
import StateButton from "../state-button";
import { useRouter, useSearchParams } from "next/navigation";
import { DateSince } from "../date";
import { ToggleButton } from "../toggle-button";
import { EntityCategories } from "../categories";
import { EditHistory } from "../edit-history";
import { SetProtectionButton } from "../protection-button";
import { ThreeColumnsLayout } from "../three-columns";
import { articleUrl, currentVersion, hasEditPermission, inRange } from "../utils";
import { articleButtonClassname } from "../editor/wiki-editor";
import { LoadingScreen } from "../loading-screen";
import NoEntityPage from "../no-entity-page";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { smoothScrollTo } from "../editor/plugins/TableOfContentsPlugin";
import { ArticleDiscussion } from "./article-discussion";
import Button from "@mui/material/Button";
import { ArticleOtherOptions } from "./article-other-options";
import { EntityCategoriesSmall } from "../entity-categories-small";
import { NeedAccountPopup } from "../need-account-popup";
import {useUser} from "../../hooks/user";
import {useTopic} from "../../hooks/topics";
import {getTopicTitle} from "./utils";
import {TopicContent} from "./topic-content";


export const editContentClassName = "article-btn lg:text-base text-sm px-1 lg:px-2 bg-[var(--primary)] text-[var(--lightwhite)] hover:bg-[var(--primary-dark)] disabled:hover:bg-[var(--primary)]"


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
        return <LoadingScreen/>
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

    const center = <div className="flex flex-col items-center w-full">
        <div className="w-full mt-8">
            <div className="flex flex-col border-b p-4">
                <div className="text-[var(--text-light)] text-sm mb-2">
                    Tema
                </div>
                <h1 className={"mb-2 " + titleFontSize}>
                    {getTopicTitle(topic.topic)}
                </h1>
                <EntityCategoriesSmall topic={topic.topic} route={[]}/>
            </div>
        </div>
        <TopicContent topic={topic.topic} version={version} selectedPanel={selectedPanel} setSelectedPanel={setSelectedPanel}/>

        {selectedPanel != "editing" && <div className="w-full" id="discussion-start">
            <ArticleDiscussion
                topic={topic.topic}
                version={version}
            />
        </div>}
    </div>

    return <>
        <ThreeColumnsLayout center={center} leftMinWidth="250px"/>
    </>
}
