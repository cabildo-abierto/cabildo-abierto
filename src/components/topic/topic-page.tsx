"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation";
import {currentVersion, inRange, isFastPost, isQuotePost} from "../utils";
import NoEntityPage from "../no-entity-page";
import { ArticleDiscussion } from "./article-discussion";
import { EntityCategoriesSmall } from "../entity-categories-small";
import {useTopic, useTopicFeed} from "../../hooks/contents";
import {getTopicTitle} from "./utils";
import {TopicContent} from "./topic-content";
import LoadingSpinner from "../loading-spinner";
import {ArticleProps, FastPostProps} from "../../app/lib/definitions";
import {validQuotePost} from "../feed/thread";
import {smoothScrollTo} from "../editor/plugins/TableOfContentsPlugin";
import {useLayoutConfig} from "../layout/layout-config-context";


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
    const [viewingContent, setViewingContent] = useState(false)
    const {setLayoutConfig} = useLayoutConfig()
    const [shouldGoTo, setShouldGoTo] = useState(null)

    useEffect(() => {
        if (shouldGoTo && viewingContent) {
            const observer = new MutationObserver(() => {
                const elem = document.getElementById(shouldGoTo);
                if (elem) {
                    console.log("Found element:", elem, shouldGoTo);
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

    /*useEffect(() => {
        if(topic.topic){
            const references = topic.topic.versions[currentVersion(topic.topic)].references
            for(let i = 0; i < references.length; i++){
                preload("/api/entity/"+references[i].entityReferenced.id, fetcher)
            }
        }
    }, [entity])*/

    if(topic.isLoading || feed.isLoading){
        return <LoadingSpinner/>
    }

    if(!topic.topic || topic.isError || topic.error || !feed.feed){
        return <NoEntityPage id={topicId}/>
    }


    const versions = topic.topic.versions
    const currentIndex = currentVersion(topic.topic)
    let version = paramsVersion
    if(paramsVersion == undefined || !inRange(paramsVersion, versions.length)){
        version = currentIndex
    }

    const replies = feed.feed.filter((r) => {return isQuotePost(r) && validQuotePost(topic.topic.versions[version].content.text, r as FastPostProps)})

    let quoteReplies = undefined
    quoteReplies = replies.filter((r) => ((r as FastPostProps).content.post.quote != undefined))

    const titleFontSize = getTopicTitle(topic.topic).length > 60 ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"

    const onClickQuote = (cid: string) => {
        setPinnedReplies([...pinnedReplies, cid])
        if(viewingContent){
            const elem = document.getElementById(cid)
            smoothScrollTo(elem)
        } else {
            setViewingContent(true)
            setLayoutConfig({distractionFree: true})
            setShouldGoTo(cid)
        }
    }

    return <div className="flex flex-col items-center w-full">
        <div className="flex flex-col border-b px-2 py-1 w-full">
            <div className="text-[var(--text-light)] text-sm mb-2">
                Tema
            </div>
            <h1 className={" " + titleFontSize}>
                {getTopicTitle(topic.topic)}
            </h1>
            <EntityCategoriesSmall topic={topic.topic} route={[]}/>
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
            <ArticleDiscussion
                topic={topic.topic}
                version={version}
                onClickQuote={onClickQuote}
            />
        </div>}
    </div>
}
