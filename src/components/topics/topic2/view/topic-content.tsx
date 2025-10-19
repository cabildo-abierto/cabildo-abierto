import {TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {useTopicVersionQuoteReplies} from "@/queries/getters/useTopic";
import {EditorWithQuoteComments, getEditorKey} from "@/components/writing/editor-with-quote-comments";
import {getEditorSettings} from "@/components/writing/settings";
import {Dispatch, SetStateAction, useState} from "react";
import {LexicalEditor} from "lexical";
import {getTopicTitle} from "@/components/topics/topic/utils";


export const TopicContent = ({
    topic,
    pinnedReplies,
    setPinnedReplies,
}: {
    topic: TopicView
    pinnedReplies: string[]
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
}) => {
    const {data: quoteReplies} = useTopicVersionQuoteReplies(topic.uri)
    const [editor, setEditor] = useState<LexicalEditor>()

    return <div className={""}>
        <div key={getEditorKey(topic.uri, quoteReplies)}>
            <EditorWithQuoteComments
                uri={topic.uri}
                cid={topic.cid}
                settings={getEditorSettings({
                    isReadOnly: true,
                    initialText: topic.text,
                    initialTextFormat: topic.format,
                    embeds: topic.embeds ?? [],
                    title: getTopicTitle(topic),
                    allowComments: true,
                    tableOfContents: true,
                    editorClassName: "relative article-content not-article-content",
                    shouldPreserveNewLines: true,
                    markdownShortcuts: false,
                    topicMentions: false
                })}
                clippedToHeight={null}
                quoteReplies={quoteReplies}
                pinnedReplies={pinnedReplies}
                setPinnedReplies={setPinnedReplies}
                replyTo={{$type: "ar.cabildoabierto.wiki.topicVersion#topicView", ...topic}}
                editor={editor}
                setEditor={setEditor}
                setEditorState={() => {}}
            />
        </div>
    </div>
}