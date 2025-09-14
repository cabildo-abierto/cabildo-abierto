import {EngagementIcons} from "@/components/feed/frame/engagement-icons";
import {Dispatch, SetStateAction, useState} from "react";
import {ArticleHeader} from "@/components/thread/article/article-header";
import {EditorWithQuoteComments} from "@/components/editor/editor-with-quote-comments";
import {getEditorSettings} from "@/components/editor/settings";
import {LexicalEditor} from "lexical";
import {$Typed} from "@/lex-api/util";
import {hasEnDiscusionLabel} from "@/components/feed/frame/post-preview-frame";
import {ScrollToQuotePost} from "@/components/feed/embed/selection-quote/scroll-to-quote-post";
import {robotoSerif} from "@/components/editor/article-font";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"


type ArticleCompProps = {
    article: $Typed<ArCabildoabiertoFeedDefs.FullArticleView>,
    quoteReplies: ArCabildoabiertoFeedDefs.PostView[]
    pinnedReplies: string[]
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
}


const Article = ({article, quoteReplies, pinnedReplies, setPinnedReplies}: ArticleCompProps) => {
    const [editor, setEditor] = useState<LexicalEditor>(null)

    const enDiscusion = hasEnDiscusionLabel(article)

    const editorId = article.uri + "-" + quoteReplies.map((r) => (r.cid.slice(0, 10))).join("-")

    const text = article.text
    const format = article.format

    return <ScrollToQuotePost setPinnedReplies={setPinnedReplies}>
        <div className="w-full">
            <div className={"p-3"}>
                <ArticleHeader article={article}/>
                <div className={"mt-8 mb-16"} id={editorId}>
                    <EditorWithQuoteComments
                        uri={article.uri}
                        cid={article.cid}
                        settings={getEditorSettings({
                            isReadOnly: true,
                            initialText: text,
                            initialTextFormat: format,
                            allowComments: true,
                            tableOfContents: true,
                            editorClassName: `article-content ${robotoSerif.variable}`,
                            embeds: article.embeds,
                            topicMentions: false
                        })}
                        quoteReplies={quoteReplies}
                        pinnedReplies={pinnedReplies}
                        setPinnedReplies={setPinnedReplies}
                        replyTo={article}
                        editor={editor}
                        clippedToHeight={null}
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

export default Article