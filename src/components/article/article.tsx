import {EngagementIcons} from "@/components/feed/frame/engagement-icons";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {smoothScrollTo} from "../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import {ArticleHeader} from "@/components/article/article-header";
import {EditorWithQuoteComments} from "@/components/editor/editor-with-quote-comments";
import {getEditorSettings} from "@/components/editor/settings";
import {LexicalEditor} from "lexical";
import {FullArticleView, PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {$Typed} from "@atproto/api";
import {hasEnDiscusionLabel} from "@/components/feed/frame/post-preview-frame";
import {ScrollToQuotePost} from "@/components/feed/embed/selection-quote/scroll-to-quote-post";

type ArticleCompProps = {
    article: $Typed<FullArticleView>,
    quoteReplies: PostView[]
    pinnedReplies: string[]
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
}

export const Article = ({article, quoteReplies, pinnedReplies, setPinnedReplies}: ArticleCompProps) => {
    const [editor, setEditor] = useState<LexicalEditor>(null)

    const enDiscusion = hasEnDiscusionLabel(article)

    const editorId = article.uri + "-" + quoteReplies.map((r) => (r.cid.slice(0, 10))).join("-")

    async function onSubmitReply() {

    }

    const text = article.text
    const format = article.format

    return <ScrollToQuotePost setPinnedReplies={setPinnedReplies}>
        <div className="w-full">
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
                        setEditorState={() => {
                        }}
                    />
                </div>
            </div>
            <div className={"py-2 px-3 border-b"}>
                <EngagementIcons
                    content={article}
                    className={"flex justify-between px-4 w-full"}
                    enDiscusion={enDiscusion}
                />
            </div>
        </div>
    </ScrollToQuotePost>
}