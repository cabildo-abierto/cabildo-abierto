import {Dispatch, SetStateAction} from "react";
import {
    TopicContentExpandedView,
    TopicContentExpandedViewWithVersion
} from "./topic-content-expanded-view";
import {useSearchParams} from "next/navigation";
import {WikiEditorState} from "@/lib/types";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"

const TopicContent = ({
                          topic,
                          pinnedReplies,
                          setPinnedReplies,
                          wikiEditorState,
                          setWikiEditorState,
                      }: {
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
    pinnedReplies: string[]
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
    wikiEditorState: WikiEditorState
    setWikiEditorState: (v: WikiEditorState) => void
}) => {
    const params = useSearchParams()

    if (params.get("did") && params.get("rkey")) {
        return <TopicContentExpandedView
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
            wikiEditorState={wikiEditorState}
            setWikiEditorState={setWikiEditorState}
            topicId={topic.id}
        />
    } else {
        return <TopicContentExpandedViewWithVersion
            topic={topic}
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
            wikiEditorState={wikiEditorState}
            setWikiEditorState={setWikiEditorState}
        />
    }
}


export default TopicContent