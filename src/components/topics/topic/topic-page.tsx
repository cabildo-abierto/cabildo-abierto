"use client"
import { useEffect, useState } from "react"
import {useRouter, useSearchParams} from "next/navigation";
import NoEntityPage from "./no-entity-page";
import { TopicDiscussion } from "./topic-discussion";
import {useTopic} from "../../../hooks/api";
import {getFullTopicCategories, getFullTopicTitle} from "./utils";
import {TopicContent, topicCurrentVersionToReplyToContent} from "./topic-content";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {smoothScrollTo} from "../../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import {useLayoutConfig} from "../../layout/layout-config-context";
import {TopicCategories} from "./topic-categories";
import {WikiEditorState} from "./topic-content-expanded-view-header";


export const TopicPage = ({topicId}: {
    topicId: string
}) => {
    const topic = useTopic(topicId)
    const searchParams = useSearchParams()
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()
    const [shouldGoTo, setShouldGoTo] = useState(null)
    const router = useRouter()
    const [pinnedReplies, setPinnedReplies] = useState([])

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

    if(topic.isLoading){
        return <LoadingSpinner/>
    }

    if(!topic.topic || topic.isError || topic.error){
        return <NoEntityPage id={topicId}/>
    }

    function setWikiEditorState(s: WikiEditorState) {
        const didParam = searchParams.get("did")
        const didParamStr = didParam ? ("&did=" + didParam) : ""
        const rkeyParam = searchParams.get("rkey")
        const rkeyParamStr = rkeyParam ? ("&rkey=" + rkeyParam) : ""

        if(s == "minimized"){
            router.push("/tema?i="+topic.topic.id)
        } else {
            router.push("/tema?i="+topic.topic.id+"&s="+s+didParamStr+rkeyParamStr)
        }
    }

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

        <div className="flex flex-col py-1 mb-2 w-full space-y-2 px-2">
            <div className="text-[var(--text-light)] text-sm">
                Tema
            </div>
            <h1 className={""}>
                {getFullTopicTitle(topic.topic)}
            </h1>
            <TopicCategories
                categories={getFullTopicCategories(topic.topic)}
            />
        </div>

        <TopicContent
            topic={topic.topic}
            wikiEditorState={wikiEditorState}
            setWikiEditorState={setWikiEditorState}
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
        />


        {(wikiEditorState == "minimized" || wikiEditorState == "normal") &&
            <div className="w-full" id="discussion-start">
                <TopicDiscussion
                    topicId={topic.topic.id}
                    replyToContent={topic.topic.currentVersion ? topicCurrentVersionToReplyToContent(topic.topic) : null}
                    onClickQuote={onClickQuote}
                    wikiEditorState={wikiEditorState}
                />
            </div>
        }
    </div>
}
