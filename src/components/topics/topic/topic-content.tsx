import { TopicProps } from "@/lib/definitions";
import { useEffect } from "react";
import { smoothScrollTo } from "../../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import { ReplyToContent } from "../../../../modules/ca-lexical-editor/src/plugins/CommentPlugin";
import { TopicContentPreview } from "./topic-content-preview";
import {
    SmallTopicVersionProps,
    TopicContentExpandedView,
    TopicContentExpandedViewWithVersion
} from "./topic-content-expanded-view";
import { WikiEditorState } from "./topic-content-expanded-view-header";
import {useSearchParams} from "next/navigation";

export const articleButtonClassname = "article-btn sm:min-w-24 sm:text-[15px] text-sm px-1 lg:px-2 py-1"


export function topicCurrentVersionToReplyToContent(topic: TopicProps): ReplyToContent {
    return {
        uri: topic.currentVersion.uri,
        cid: topic.currentVersion.content.record.cid,
        collection: "ar.com.cabildoabierto.topic",
        author: topic.currentVersion.content.record.author,
        content: {
            ...topic.currentVersion.content,
            topicVersion: {
                topic: {
                    id: topic.id
                }
            }
        }
    }
}


export function topicVersionPropsToReplyToContent(topicVersion: SmallTopicVersionProps, topicId: string): ReplyToContent {
    return {
        uri: topicVersion.uri,
        cid: topicVersion.content.record.cid,
        collection: "ar.com.cabildoabierto.topic",
        content: {
            ...topicVersion.content,
            topicVersion: {
                topic: {
                    id: topicId
                }
            }
        }
    }
}


export const TopicContent = ({
    topic,
    pinnedReplies,
    setPinnedReplies,
    wikiEditorState,
    setWikiEditorState,
}: {
    topic: TopicProps
    pinnedReplies: string[]
    setPinnedReplies: (v: string[]) => void
    wikiEditorState: WikiEditorState
    setWikiEditorState: (v: WikiEditorState) => void
}) => {
    const params = useSearchParams()

    useEffect(() => {
        const hash = window.location.hash
        if (hash) {
            const id = hash.split("#")[1]
            const scrollToElement = () => {
                const element = document.getElementById(id)
                if (element) {
                    smoothScrollTo(element)
                    setPinnedReplies([...pinnedReplies, id])
                } else {
                    setTimeout(scrollToElement, 100)
                }
            }
            scrollToElement()
        }
    }, [])


    if(wikiEditorState == "minimized") {
        return <div className={"px-2 w-full"}>
            <TopicContentPreview
                topic={topic}
                onMaximize={() => {setWikiEditorState("normal")}}
            />
        </div>
    } else {
        if(params.get("did") && params.get("rkey")){
            return <TopicContentExpandedView
                topic={topic}
                pinnedReplies={pinnedReplies}
                setPinnedReplies={setPinnedReplies}
                wikiEditorState={wikiEditorState}
                setWikiEditorState={setWikiEditorState}
            />
        } else {
            return <TopicContentExpandedViewWithVersion
                topic={topic}
                pinnedReplies={pinnedReplies}
                setPinnedReplies={setPinnedReplies}
                wikiEditorState={wikiEditorState}
                setWikiEditorState={setWikiEditorState}
                topicVersion={topic.currentVersion ? {
                    uri: topic.currentVersion.uri,
                    content: {
                        text: topic.currentVersion.content.text,
                        format: topic.currentVersion.content.format,
                        record: topic.currentVersion.content.record
                    }
                } : null}
            />
        }
    }
}