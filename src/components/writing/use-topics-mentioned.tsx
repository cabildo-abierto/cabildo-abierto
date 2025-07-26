import {useEffect, useState} from "react";
import {TopicMention} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {LexicalEditor} from "lexical";
import {post} from "@/utils/fetch";

export const useTopicsMentioned = (initialTitle?: string) => {
    const [topicsMentioned, setTopicsMentioned] = useState<TopicMention[]>([])
    const [lastMentionsFetch, setLastMentionsFetch] = useState(new Date(0))
    const [lastTextChange, setLastTextChange] = useState(new Date(0))
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [title, setTitle] = useState(initialTitle ?? "")


    useEffect(() => {
        const interval = setInterval(() => {
            if(!editor) return
            if (
                lastTextChange.getTime() - lastMentionsFetch.getTime() > 10000 ||
                (Date.now() - lastTextChange.getTime() > 3000 && lastTextChange.getTime() > lastMentionsFetch.getTime())
            ) {
                setLastMentionsFetch(new Date());

                const fetchTopicsMentioned = async () => {
                    try {
                        const editorStateStr = JSON.stringify(editor.getEditorState().toJSON());

                        const { editorStateToMarkdownNoEmbeds } = await import("../../../modules/ca-lexical-editor/src/markdown-transforms");

                        const mdText = editorStateToMarkdownNoEmbeds(editorStateStr);
                        let data: TopicMention[] = []
                        if (mdText.length + title.length > 0) {
                            data = (await post<{ title: string; text: string }, TopicMention[]>(
                                `/get-topics-mentioned`,
                                {title, text: mdText}
                            )).data
                        }
                        if (data) {
                            setTopicsMentioned(data);
                        }
                    } catch (error) {
                        console.error("Error running async function:", error);
                    }
                };

                fetchTopicsMentioned();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [lastTextChange, lastMentionsFetch, editor, title]);

    return {
        topicsMentioned,
        lastTextChange,
        setLastTextChange,
        editor,
        setEditor,
        title,
        setTitle
    }
}