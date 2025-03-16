import { FastPostProps, TopicProps, TopicVersionProps } from "../../app/lib/definitions";
import { useEffect } from "react";
import { smoothScrollTo } from "../editor/plugins/TableOfContentsPlugin";
import { ReplyToContent } from "../editor/plugins/CommentPlugin";
import { getCurrentContentVersion } from "./utils";
import { TopicContentPreview } from "./topic-content-preview";
import { TopicContentExpandedView } from "./topic-content-expanded-view";
import { WikiEditorState } from "./topic-content-expanded-view-header";

export const articleButtonClassname = "article-btn sm:min-w-24 sm:text-[15px] text-sm px-1 lg:px-2 py-1"


export function topicVersionPropsToReplyToContent(topicVersion: TopicVersionProps, topicId: string): ReplyToContent {
    return {
        uri: topicVersion.uri,
        cid: topicVersion.cid,
        collection: "ar.com.cabildoabierto.topic",
        author: topicVersion.author,
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
    version,
    quoteReplies, pinnedReplies, setPinnedReplies,
    wikiEditorState,
    setWikiEditorState,
}: {
    topic: TopicProps
    version: number
    quoteReplies: FastPostProps[]
    pinnedReplies: string[]
    setPinnedReplies: (v: string[]) => void
    wikiEditorState: WikiEditorState
    setWikiEditorState: (v: WikiEditorState) => void
}) => {
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
        const currentContentVersion = getCurrentContentVersion(topic)
        return <TopicContentPreview
            topicId={topic.id}
            topicVersion={topic.versions[currentContentVersion]}
            onMaximize={() => {setWikiEditorState("normal")}}
        />
    } else {
        return <TopicContentExpandedView
            topic={topic}
            version={version}
            quoteReplies={quoteReplies}
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
            wikiEditorState={wikiEditorState}
            setWikiEditorState={setWikiEditorState}
        />
    }
}