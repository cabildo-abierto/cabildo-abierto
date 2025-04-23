import { TopicProps } from "@/lib/types";
import { useEffect } from "react";
import { smoothScrollTo } from "../../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import { TopicContentPreview } from "./topic-content-preview";
import {
    SmallTopicVersionProps,
    TopicContentExpandedView,
    TopicContentExpandedViewWithVersion
} from "./topic-content-expanded-view";
import { WikiEditorState } from "./topic-content-expanded-view-header";
import {useSearchParams} from "next/navigation";
import {ReplyToContent} from "@/components/writing/write-panel/write-panel";



export function topicCurrentVersionToReplyToContent(topic: TopicProps): ReplyToContent {
    // TO DO
    return {} as ReplyToContent
}


export function topicVersionPropsToReplyToContent(topicVersion: SmallTopicVersionProps, topicId: string): ReplyToContent {
    // TO DO
    return {} as ReplyToContent
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
            const cid = hash.split("#")[1]
            const scrollToElement = () => {
                const element = document.getElementById(cid)
                if (element) {
                    smoothScrollTo(element)
                    setPinnedReplies([...pinnedReplies, cid])
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