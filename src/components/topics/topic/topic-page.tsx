"use client"
import {useCallback, useEffect, useState} from "react"
import {useSearchParams} from "next/navigation";
import {useTopicWithNormalizedContent} from "@/queries/getters/useTopic";
import {getTopicCategories, getTopicTitle} from "./utils";
import LoadingSpinner from "../../layout/utils/loading-spinner";
import {updateSearchParams} from "@/utils/fetch";
import TopicTutorial from "@/components/layout/tutorial/topic-tutorial";
import {getUri} from "@/utils/uri";
import {WikiEditorState} from "@/lib/types";
import {smoothScrollTo} from "../../layout/utils/scroll";
import TopicNotFoundPage from "@/components/topics/topic/topic-not-found-page";
import TopicCategories from "@/components/topics/topic/topic-categories";
import dynamic from "next/dynamic";
const TopicContent = dynamic(() => import("@/components/topics/topic/topic-content"), {ssr: false})
const TopicDiscussion = dynamic(() => import("@/components/topics/topic/topic-discussion"), {ssr: false})


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

export function useTopicPageParams() {
    const searchParams = useSearchParams()
    const did = searchParams.get("did")
    const rkey = searchParams.get("rkey")
    const topicId = searchParams.get("i")
    const s = searchParams.get("s")

    return {did, rkey, topicId, s: s && isWikiEditorState(s) ? s : "minimized"}
}

export const TopicPage = () => {
    const {did, rkey, topicId, s} = useTopicPageParams()
    const {query: topicQuery, topic} = useTopicWithNormalizedContent(topicId, did, rkey)
    const [pinnedReplies, setPinnedReplies] = useState<string[]>([])
    const wikiEditorState = (s)
    const {setShouldGoTo} = useShouldGoTo(wikiEditorState)

    const setWikiEditorStateAndRouterPush = useCallback((s: WikiEditorState) => {
        const params = {
            s,
            i: topic && topic != "loading" ? topic.id : undefined,
            did: did ?? undefined,
            rkey: rkey ?? undefined
        }
        console.log("updating search params", params)
        updateSearchParams(params)
    }, [did, rkey, topic])

    if (topicQuery.isLoading || topic == "loading") {
        return <div className={"py-64"}>
            <LoadingSpinner/>
        </div>
    }

    if (!topic) {
        return <TopicNotFoundPage id={topicId}/>
    }

    const onClickQuote = (cid: string) => {
        if (!pinnedReplies.includes(cid)) {
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

    const topicVersionUri = did && rkey ? getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey) : topic.uri

    return <TopicTutorial wikiState={wikiEditorState}>
        <div className="flex flex-col items-center w-full min-[500px]:pt-4 mt-8">
            <div className="flex flex-col py-1 mb-2 w-full px-2 sm:space-y-2" id={"topic-header"}>
                <h1 className={"font-extrabold normal-case"}>
                    {getTopicTitle(topic)}
                </h1>
                <TopicCategories
                    className={"text-[var(--text-light)] font-light text-sm hover:bg-[var(--background-dark)]"}
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

            {["minimized", "normal", "props", "history"].includes(wikiEditorState) &&
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
