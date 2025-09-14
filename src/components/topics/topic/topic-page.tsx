"use client"
import {useEffect, useState} from "react"
import {useSearchParams} from "next/navigation";
import {useTopicWithNormalizedContent} from "@/queries/useTopic";
import {getTopicCategories, getTopicTitle} from "./utils";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {updateSearchParams} from "@/utils/fetch";
import dynamic from "next/dynamic";
import {MobileHeader} from "@/components/layout/mobile-header";
import TopicTutorial from "@/components/tutorial/topic-tutorial";
import {getUri} from "@/utils/uri";
import {WikiEditorState} from "@/lib/types";
import {smoothScrollTo} from "../../../../modules/ui-utils/src/scroll";

const TopicDiscussion = dynamic(() => import("./topic-discussion"))
const TopicContent = dynamic(() => import("./topic-content"))
const TopicCategories = dynamic(() => import("./topic-categories"))
const TopicNotFoundPage = dynamic(() => import("./topic-not-found-page"))

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

export function isWikiEditorState(s: string): s is WikiEditorState {
    return ["changes", "authors", "normal", "editing", "editing-props", "props", "minimized", "history"].includes(s)
}

export const TopicPage = ({topicId, did, rkey}: {
    topicId?: string
    did?: string
    rkey?: string
}) => {
    const {query: topicQuery, topic} = useTopicWithNormalizedContent(topicId, did, rkey)
    const searchParams = useSearchParams()
    const [pinnedReplies, setPinnedReplies] = useState<string[]>([])
    const s = searchParams.get("s")
    const wikiEditorState = (s && isWikiEditorState(s) ? s : "minimized")
    const {setShouldGoTo} = useShouldGoTo(wikiEditorState)

    if (topicQuery.isLoading || topic == "loading") {
        return <div className={"py-16"}>
            <LoadingSpinner/>
        </div>
    }

    if (!topic) {
        return <TopicNotFoundPage id={topicId}/>
    }

    function setWikiEditorStateAndRouterPush(s: WikiEditorState) {
        const params = {
            s,
            i: topic && topic != "loading" ? topic.id : undefined,
            did: did ?? undefined,
            rkey: rkey ?? undefined
        }
        updateSearchParams(params)
    }

    const onClickQuote = (cid: string) => {
        if(!pinnedReplies.includes(cid)){
            setPinnedReplies([cid])
        }
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

    const topicVersionUri = topicId ? topic.uri : getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey)

    return <TopicTutorial wikiState={wikiEditorState}>
        <div className="flex flex-col items-center w-full min-[500px]:pt-4">
        <MobileHeader/>
        <div className="flex flex-col py-1 sm:mt-8 mb-2 w-full sm:space-y-2 px-2" id={"topic-header"}>
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
                    topic={topic}
                    topicVersionUri={topicVersionUri}
                    replyToContent={{$type: "ar.cabildoabierto.wiki.topicVersion#topicView", ...topic}}
                    onClickQuote={onClickQuote}
                    wikiEditorState={wikiEditorState}
                />
            </div>}
    </div>
    </TopicTutorial>
}
