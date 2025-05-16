"use client"
import {useEffect, useState} from "react"
import {useSearchParams} from "next/navigation";


import {useTopic, useTopicFeed} from "@/queries/api";
import {getTopicCategories, getTopicTitle} from "./utils";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {smoothScrollTo} from "../../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import {WikiEditorState} from "./topic-content-expanded-view-header";
import {updateSearchParam} from "@/utils/fetch";
import dynamic from "next/dynamic";

const TopicDiscussion = dynamic(() => import("./topic-discussion"))
const TopicContent = dynamic(() => import("./topic-content"))
const TopicCategories = dynamic(() => import("./topic-categories"))
const TopicNotFoundPage = dynamic(() => import("./no-entity-page"))

function useShouldGoTo(wikiEditorState: WikiEditorState) {
    const [shouldGoTo, setShouldGoTo] = useState(null)

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

            observer.observe(document.body, {childList: true, subtree: true});
            return () => observer.disconnect();
        }
    }, [shouldGoTo, wikiEditorState])

    return {setShouldGoTo}
}

export const TopicPage = ({topicId}: {
    topicId: string
}) => {
    const {data} = useTopicFeed(topicId) // prefetch
    const {data: topic, isLoading} = useTopic(topicId)
    const searchParams = useSearchParams()
    const [pinnedReplies, setPinnedReplies] = useState<string[]>([])
    const wikiEditorState = ((searchParams.get("s") ? searchParams.get("s") : "minimized") as WikiEditorState)
    const {setShouldGoTo} = useShouldGoTo(wikiEditorState)

    if (isLoading) {
        return <LoadingSpinner/>
    }

    if (!topic) {
        return <TopicNotFoundPage id={topicId}/>
    }

    function setWikiEditorStateAndRouterPush(s: WikiEditorState) {
        updateSearchParam("s", s)

        if (s == "minimized") {
            updateSearchParam("did", null)
            updateSearchParam("rkey", null)
        }
    }

    const onClickQuote = (cid: string) => {
        setPinnedReplies([cid])
        if (wikiEditorState != "minimized") {
            const elem = document.getElementById("selection:" + cid)
            if (elem) {
                smoothScrollTo(elem)
            }
        } else {
            setWikiEditorStateAndRouterPush("normal")
            setShouldGoTo(cid)
        }
    }

    return <div className="flex flex-col items-center w-full pt-4">
        <div className="flex flex-col py-1 mb-2 w-full space-y-2 px-2">
            <div className="text-[var(--text-light)] text-sm">
                Tema
            </div>
            <h1>
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

        {(wikiEditorState == "minimized" || wikiEditorState == "normal" || wikiEditorState == "props") &&
            <div className="w-full" id="discussion-start">
                <TopicDiscussion
                    topicId={topic.id}
                    replyToContent={{$type: "ar.cabildoabierto.wiki.topicVersion#topicView", ...topic}}
                    onClickQuote={onClickQuote}
                    wikiEditorState={wikiEditorState}
                />
            </div>}
    </div>
}
