"use client"
import {EngagementIcons} from "@/components/feed/reactions/engagement-icons";
import {useEffect, useState} from "react";
import {smoothScrollTo} from "../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import {useSWRConfig} from "swr";
import {threadApiUrl} from "@/utils/uri";
import {ArticleHeader} from "@/components/article/article-header";
import {EditorWithQuoteComments} from "@/components/editor/editor-with-quote-comments";
import {getEditorSettings} from "@/components/editor/settings";
import {LexicalEditor} from "lexical";
import {FullArticleView, PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {$Typed} from "@atproto/api";

type ArticleCompProps = {
    article: $Typed<FullArticleView>,
    quoteReplies: PostView[]
    pinnedReplies: string[]
    setPinnedReplies: (v: string[]) => void
}

export const Article = ({article, quoteReplies, pinnedReplies, setPinnedReplies}: ArticleCompProps) => {
    const {mutate} = useSWRConfig()
    const [editor, setEditor] = useState<LexicalEditor>(null)

    const enDiscusion = false // TO DO

    useEffect(() => {
        const hash = window.location.hash
        if (hash) {
            const cid = hash.split("#")[1]
            const scrollToElement = () => {
                const element = document.getElementById(cid);
                if (element) {
                    smoothScrollTo(element)
                    setPinnedReplies([...pinnedReplies, cid])
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

    const text = article.text
    const format = article.textFormat

    return <div className="w-full">
        <div className={"p-3 border-b"}>
            <ArticleHeader article={article}/>
            <div className={"mt-8 mb-16"} id={editorId}>
                <EditorWithQuoteComments
                    settings={getEditorSettings({
                        isReadOnly: true,
                        initialText: text,
                        initialTextFormat: format,
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
                    setEditorState={() => {}}
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
                enDiscusion={enDiscusion}
            />
        </div>
    </div>
}