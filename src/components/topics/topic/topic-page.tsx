"use client"
import { useEffect, useState } from "react"
import {useRouter, useSearchParams} from "next/navigation";
import TopicNotFoundPage from "./no-entity-page";
import { TopicDiscussion } from "./topic-discussion";
import {useTopic} from "@/hooks/api";
import {getTopicCategories, getTopicTitle} from "./utils";
import {TopicContent} from "./topic-content";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {smoothScrollTo} from "../../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import {useLayoutConfig} from "../../layout/layout-config-context";
import {TopicCategories} from "./topic-categories";
import {WikiEditorState} from "./topic-content-expanded-view-header";


export function updateSearchParam(key: string, value: string | string[] | null) {
    const url = new URL(window.location.href);
    url.searchParams.delete(key)

    if(Array.isArray(value)){
        value.forEach(x => url.searchParams.append(key, x));
    } else {
        url.searchParams.set(key, value)
    }

    window.history.pushState({}, '', url.toString());
}


export const TopicPage = ({topicId}: {
    topicId: string
}) => {
    const {data: topic, isLoading} = useTopic(topicId)
    const searchParams = useSearchParams()
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()
    const [shouldGoTo, setShouldGoTo] = useState(null)
    const [pinnedReplies, setPinnedReplies] = useState<string[]>([])
    const wikiEditorState = ((searchParams.get("s") ? searchParams.get("s") : "minimized") as WikiEditorState)

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
                rightMinWidth: "300px"
            }))
        } else {
            setLayoutConfig((prev) => ({
                ...prev,
                openSidebar: false,
                openRightPanel: false,
                maxWidthCenter: "800px",
                rightMinWidth: "300px"
            }))
        }
    }, [wikiEditorState])

    if(isLoading){
        return <LoadingSpinner/>
    }

    if(!topic){
        return <TopicNotFoundPage id={topicId}/>
    }

    function setWikiEditorStateAndRouterPush(s: WikiEditorState) {
        updateSearchParam("s", s)

        if(s == "minimized"){
            updateSearchParam("did", null)
            updateSearchParam("rkey", null)
        }
    }

    const onClickQuote = (cid: string) => {
        //if(!pinnedReplies.includes(cid)){
        //    setPinnedReplies([cid])
        //}
        setPinnedReplies([cid])
        if(wikiEditorState != "minimized"){
            const elem = document.getElementById("selection:"+cid)
            if(elem){
                smoothScrollTo(elem)
            }
        } else {
            setWikiEditorStateAndRouterPush("normal")
            setLayoutConfig({...layoutConfig, openRightPanel: false, maxWidthCenter: "800px"})
            setShouldGoTo(cid)
        }
    }

    return <div className="flex flex-col items-center w-full pt-4">

        <div className="flex flex-col py-1 mb-2 w-full space-y-2 px-2">
            <div className="text-[var(--text-light)] text-sm">
                Tema
            </div>
            <h1 className={""}>
                {getTopicTitle(topic)}
            </h1>
            <TopicCategories
                categories={getTopicCategories(topic.props)}
            />
        </div>

        <TopicContent
            topic={topic}
            wikiEditorState={wikiEditorState}
            setWikiEditorState={setWikiEditorStateAndRouterPush}
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
        />


        {(wikiEditorState == "minimized" || wikiEditorState == "normal") &&
            <div className="w-full" id="discussion-start">
                <TopicDiscussion
                    topicId={topic.id}
                    replyToContent={{$type: "ar.cabildoabierto.wiki.topicVersion#topicView", ...topic}}
                    onClickQuote={onClickQuote}
                    wikiEditorState={wikiEditorState}
                />
            </div>
        }
    </div>
}
