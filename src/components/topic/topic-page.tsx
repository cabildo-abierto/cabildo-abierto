"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation";
import {getCurrentVersion, inRange, isQuotePost} from "../utils/utils";
import NoEntityPage from "./no-entity-page";
import { TopicDiscussion } from "./topic-discussion";
import {useTopic, useTopicFeed} from "../../hooks/contents";
import {getFullTopicCategories, getFullTopicTitle} from "./utils";
import {TopicContent} from "./topic-content";
import LoadingSpinner from "../ui-utils/loading-spinner";
import {FastPostProps} from "../../app/lib/definitions";
import {smoothScrollTo} from "../editor/plugins/TableOfContentsPlugin";
import {useLayoutConfig} from "../layout/layout-config-context";
import {TopicCategories} from "./topic-categories";


export const TopicPage = ({topicId, paramsVersion, changes}: {
    topicId: string,
    paramsVersion?: number,
    changes?: boolean
}) => {
    const topic = useTopic(topicId)
    const feed = useTopicFeed(topicId)
    const initialSelection = changes ? "changes" : (paramsVersion == undefined ? "none" : "history")
    const [selectedPanel, setSelectedPanel] = useState(initialSelection)
    const searchParams = useSearchParams()
    const [pinnedReplies, setPinnedReplies] = useState([])
    const [viewingContent, setViewingContent] = useState(paramsVersion != undefined)
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()
    const [shouldGoTo, setShouldGoTo] = useState(null)

    useEffect(() => {
        if(viewingContent && layoutConfig.openRightPanel){
            setLayoutConfig({
                ...layoutConfig,
                openRightPanel: false,
                maxWidthCenter: "800px"
            })
        }
    }, [layoutConfig, viewingContent])

    useEffect(() => {
        if (shouldGoTo && viewingContent) {
            const observer = new MutationObserver(() => {
                const elem = document.getElementById(shouldGoTo);
                if (elem) {
                    smoothScrollTo(elem);
                    setShouldGoTo(null);
                    observer.disconnect();
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
            return () => observer.disconnect();
        }
    }, [shouldGoTo, viewingContent]);

    useEffect(() => {
        setSelectedPanel(changes ? "changes" : (paramsVersion == undefined ? "none" : "history"))
    }, [searchParams])

    if(topic.isLoading || feed.isLoading){
        return <LoadingSpinner/>
    }

    if(!topic.topic || topic.isError || topic.error || !feed.feed || topic.topic.versions.length == 0){
        return <NoEntityPage id={topicId}/>
    }

    const versions = topic.topic.versions
    const currentIndex = getCurrentVersion(topic.topic)
    let version = paramsVersion
    if(paramsVersion == undefined || !inRange(paramsVersion, versions.length)){
        version = currentIndex
    }

    const quoteReplies = feed.feed.filter((r) => {
        return isQuotePost(r) && (r as FastPostProps).content.post.quote != undefined
    }) as FastPostProps[]

    const onClickQuote = (cid: string) => {
        setPinnedReplies([...pinnedReplies, cid])
        if(viewingContent){
            const elem = document.getElementById(cid)
            smoothScrollTo(elem)
        } else {
            setViewingContent(true)
            setLayoutConfig({...layoutConfig, openRightPanel: false, maxWidthCenter: "800px"})
            setShouldGoTo(cid)
        }
    }

    return <div className="flex flex-col items-center w-full pt-4">
        <div className="flex flex-col px-2 py-1 mb-2 w-full">
            <div className="text-[var(--text-light)] text-sm">
                Tema
            </div>
            <h1 className={"mb-2"}>
                {getFullTopicTitle(topic.topic)}
            </h1>
            <TopicCategories
                categories={getFullTopicCategories(topic.topic)}
            />
        </div>
        <TopicContent
            topic={topic.topic}
            version={version}
            selectedPanel={selectedPanel}
            setSelectedPanel={setSelectedPanel}
            quoteReplies={quoteReplies}
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
            viewingContent={viewingContent}
            setViewingContent={setViewingContent}
        />

        {selectedPanel != "editing" && <div className="w-full" id="discussion-start">
            {<TopicDiscussion
                viewingContent={viewingContent}
                topic={topic.topic}
                version={version}
                onClickQuote={onClickQuote}
            />}
        </div>}
    </div>
}
