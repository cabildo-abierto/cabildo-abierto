import {TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {useTopicVersionQuoteReplies} from "@/queries/getters/useTopic";
import {EditorWithQuoteComments, getEditorKey} from "@/components/writing/editor-with-quote-comments";
import {getEditorSettings} from "@/components/writing/settings";
import {Dispatch, SetStateAction, useState} from "react";
import {LexicalEditor} from "lexical";
import {getTopicTitle} from "@/components/topics/topic/utils";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api";

function emptyTopic(topic: ArCabildoabiertoWikiTopicVersion.TopicView) {
    if (!topic.text || topic.text.trim().length == 0) {
        const embeds = topic.embeds
        return !embeds || embeds.length == 0
    }
    return false
}


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

    const empty = emptyTopic(topic) && topic.currentVersion == topic.uri

    return <div key={getEditorKey(topic.uri, quoteReplies)}>
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
                editorClassName: "relative article-content not-article-content " + (empty ? "pb-32" : ""),
                shouldPreserveNewLines: true,
                markdownShortcuts: false,
                topicMentions: false,
                placeholder: empty ? "¡Este tema no tiene contenido! Editalo para crear una primera versión." : undefined
            })}
            clippedToHeight={null}
            quoteReplies={quoteReplies}
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
            replyTo={{$type: "ar.cabildoabierto.wiki.topicVersion#topicView", ...topic}}
            editor={editor}
            setEditor={setEditor}
            setEditorState={() => {
            }}
        />
    </div>
}