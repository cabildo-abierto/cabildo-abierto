import {Dispatch, SetStateAction} from "react";
import { TopicContentPreview } from "./topic-content-preview";
import {
    TopicContentExpandedView,
    TopicContentExpandedViewWithVersion
} from "./topic-content-expanded-view";
import { WikiEditorState } from "./topic-content-expanded-view-header";
import {useSearchParams} from "next/navigation";
import {TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";


const TopicContent = ({
    topic,
    pinnedReplies,
    setPinnedReplies,
    wikiEditorState,
    setWikiEditorState,
}: {
    topic: TopicView
    pinnedReplies: string[]
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
    wikiEditorState: WikiEditorState
    setWikiEditorState: (v: WikiEditorState) => void
}) => {
    const params = useSearchParams()

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
}


export default TopicContent