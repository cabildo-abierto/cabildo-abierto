"use client"
import {useEffect, useState} from "react"
import {useRouter, useSearchParams} from "next/navigation";


import {useTopic, useTopicFeed} from "@/queries/api";
import {getTopicCategories, getTopicTitle} from "./utils";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {smoothScrollTo} from "../../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import {WikiEditorState} from "./topic-content-expanded-view-header";
import {updateSearchParam} from "@/utils/fetch";
import dynamic from "next/dynamic";
import {PrettyJSON} from "../../../../modules/ui-utils/src/pretty-json";
import {topicUrl} from "@/utils/uri";

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
                } else {
                    console.log("didn't find element")
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
    const {data} = useTopicFeed(topicId, did, rkey) // prefetch
    const {data: topic, isLoading} = useTopic(topicId, did, rkey)
    const searchParams = useSearchParams()
    const [pinnedReplies, setPinnedReplies] = useState<string[]>([])
    const s = searchParams.get("s")
    const wikiEditorState = (s && isWikiEditorState(s) ? s : "minimized")
    const {setShouldGoTo} = useShouldGoTo(wikiEditorState)

    if (isLoading) {
        return <LoadingSpinner/>
    }

    if (!topic) {
        return <TopicNotFoundPage id={topicId}/>
    }

    function setWikiEditorStateAndRouterPush(s: WikiEditorState) {
        updateSearchParam("s", s)
        updateSearchParam("i", topic.id)
        updateSearchParam("did", did ?? null)
        updateSearchParam("rkey", rkey ?? null)
        console.log("setting editor state and pushing", s, topic.id, did, rkey)
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
