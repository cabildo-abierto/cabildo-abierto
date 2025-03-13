"use client"
import { useEffect, useState } from "react"
import {useRouter, useSearchParams} from "next/navigation";
import {getCurrentVersion, inRange, isQuotePost, PrettyJSON, topicUrl} from "../utils/utils";
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
import {WikiEditorState} from "./topic-content-expanded-view-header";
import {ErrorPage} from "../ui-utils/error-page";
import Link from "next/link";


export const TopicPage = ({topicId, paramsVersion}: {
    topicId: string,
    paramsVersion?: number
}) => {
    const topic = useTopic(topicId)
    const feed = useTopicFeed(topicId)
    const searchParams = useSearchParams()
    const [pinnedReplies, setPinnedReplies] = useState([])
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()
    const [shouldGoTo, setShouldGoTo] = useState(null)
    const router = useRouter()

    const wikiEditorState = (searchParams.get("s") ? searchParams.get("s") : "minimized") as WikiEditorState

    useEffect(() => {
        if(wikiEditorState != "minimized" && layoutConfig.openRightPanel){
            setLayoutConfig({
                ...layoutConfig,
                openRightPanel: false,
                maxWidthCenter: "800px"
            })
        }
    }, [layoutConfig, wikiEditorState])

    useEffect(() => {
        if (shouldGoTo && wikiEditorState != "minimized") {
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
    }, [shouldGoTo, wikiEditorState])

    useEffect(() => {
        if(wikiEditorState == "minimized"){
            setLayoutConfig((prev) => ({
                ...prev,
                openSidebar: true,
                openRightPanel: true,
                maxWidthCenter: "600px",
                rightMinWidth: "275px"
            }))
        } else {
            setLayoutConfig((prev) => ({
                ...prev,
                openSidebar: false,
                openRightPanel: false,
                maxWidthCenter: "800px",
                rightMinWidth: "360px"
            }))
        }
    }, [wikiEditorState])

    if(topic.isLoading || feed.isLoading){
        return <LoadingSpinner/>
    }

    if(!topic.topic || topic.isError || topic.error || !feed.feed || topic.topic.versions.length == 0){
        return <NoEntityPage id={topicId}/>
    }

    if(paramsVersion >= topic.topic.versions.length){
        return <ErrorPage>
            <div className={"link flex flex-col items-center"}>
                <div>
                    No existe esta versión del tema.
                </div>
                <div>
                    <Link href={topicUrl(topic.topic.id, undefined, wikiEditorState)}>Ir a la versión actual.</Link>
                </div>
            </div>
        </ErrorPage>
    }

    function setWikiEditorState(s: WikiEditorState) {
        const vParam = searchParams.get("v")
        const vParamStr = vParam ? ("&v=" + vParam) : ""

        if(s == "minimized"){
            router.push("/tema?i="+topic.topic.id+vParamStr)
        } else {
            router.push("/tema?i="+topic.topic.id+"&s="+s+vParamStr)
        }
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
        if(wikiEditorState != "minimized"){
            const elem = document.getElementById(cid)
            smoothScrollTo(elem)
        } else {
            setWikiEditorState("normal")
            setLayoutConfig({...layoutConfig, openRightPanel: false, maxWidthCenter: "800px"})
            setShouldGoTo(cid)
        }
    }

    return <div className="flex flex-col items-center w-full pt-4">
        <div className="flex flex-col mx-2 py-1 mb-2 w-full">
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
            wikiEditorState={wikiEditorState}
            setWikiEditorState={setWikiEditorState}
            quoteReplies={quoteReplies}
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
        />

        {(wikiEditorState == "minimized" || wikiEditorState == "normal") &&
            <div className="w-full" id="discussion-start">
                <TopicDiscussion
                    topic={topic.topic}
                    version={version}
                    onClickQuote={onClickQuote}
                    wikiEditorState={wikiEditorState}
                />
            </div>
        }
    </div>
}
