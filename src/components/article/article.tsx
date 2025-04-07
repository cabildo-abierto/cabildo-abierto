"use client"
import {ArticleProps, FastPostProps} from '@/lib/definitions'
import ReadOnlyEditor from '../editor/read-only-editor'
import {EngagementIcons} from "@/components/feed/reactions/engagement-icons";
import {useEffect, useState} from "react";
import {smoothScrollTo} from "../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import {useSWRConfig} from "swr";
import {threadApiUrl} from "@/utils/uri";
import {ArticleHeader} from "@/components/article/article-header";
import {EditorWithQuoteComments} from "@/components/editor/editor-with-quote-comments";
import {getEditorSettings} from "@/components/editor/settings";
import {topicVersionPropsToReplyToContent} from "@/components/topics/topic/topic-content";
import {EditorState, LexicalEditor} from "lexical";

type ArticleCompProps = {
    article: ArticleProps,
    quoteReplies: FastPostProps[]
    pinnedReplies: string[]
    setPinnedReplies: (v: string[]) => void
}

export const Article = ({article, quoteReplies, pinnedReplies, setPinnedReplies}: ArticleCompProps) => {
    const {mutate} = useSWRConfig()
    const [editor, setEditor] = useState<LexicalEditor>(null)
    const [editorState, setEditorState] = useState<EditorState>(null)

    useEffect(() => {
        const hash = window.location.hash
        if (hash) {
            const id = hash.split("#")[1]
            const scrollToElement = () => {
                const element = document.getElementById(id);
                if (element) {
                    smoothScrollTo(element)
                    setPinnedReplies([...pinnedReplies, id])
                } else {
                    setTimeout(scrollToElement, 100)
                }
            };
            scrollToElement()
        }
    }, [pinnedReplies, setPinnedReplies])

    const editorId = article.uri+"-"+quoteReplies.map((r) => (r.cid.slice(0, 10))).join("-")

    async function onSubmitReply(){

    }

    return <div className="w-full">
        <div className={"p-3 border-b"}>
            <ArticleHeader article={article}/>
            <div className={"mt-8"} id={editorId}>
                <EditorWithQuoteComments
                    settings={getEditorSettings({
                        isReadOnly: true,
                        initialText: article.content.text,
                        initialTextFormat: article.content.format,
                        allowComments: true,
                        tableOfContents: true,
                        editorClassName: "article-content"
                    })}
                    quoteReplies={quoteReplies}
                    pinnedReplies={pinnedReplies}
                    setPinnedReplies={setPinnedReplies}
                    replyTo={article}
                    onSubmitReply={onSubmitReply}
                    editor={editor}
                    setEditor={setEditor}
                    setEditorState={setEditorState}
                />
            </div>
        </div>
        <div className={"py-2 px-3 border-b"}>
            <EngagementIcons
                counters={article}
                record={article}
                className={"flex justify-between px-4 w-full"}
                onDelete={async () => {
                    mutate(threadApiUrl(article.uri))
                }}
            />
        </div>
    </div>
}