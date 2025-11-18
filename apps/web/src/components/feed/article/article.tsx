import {EngagementIcons} from "../utils/engagement-icons";
import React, {Dispatch, SetStateAction, useState} from "react";
import {ArticleHeader} from "./article-header";
import {EditorWithQuoteComments, getEditorKey} from "../../writing/editor-with-quote-comments";
import {getEditorSettings} from "../../writing/settings";
import {LexicalEditor} from "lexical";
import {$Typed} from "@cabildo-abierto/api";
import {hasEnDiscusionLabel} from "../utils/post-preview-frame";
import {ScrollToQuotePost} from "../embed/selection-quote/scroll-to-quote-post";
import {robotoSerif} from "../../writing/article-font";
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {useLayoutConfig} from "../../layout/main-layout/layout-config-context";
import {cn} from "@/lib/utils";
import {pxToNumber} from "@cabildo-abierto/utils";


type ArticleCompProps = {
    article: $Typed<ArCabildoabiertoFeedDefs.FullArticleView>,
    quoteReplies: ArCabildoabiertoFeedDefs.PostView[]
    pinnedReplies: string[]
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
}


const Article = ({article, quoteReplies, pinnedReplies, setPinnedReplies}: ArticleCompProps) => {
    const [editor, setEditor] = useState<LexicalEditor>(null)
    const {layoutConfig, width} = useLayoutConfig()

    const enDiscusion = hasEnDiscusionLabel(article)

    const text = article.text
    const format = article.format

    return <ScrollToQuotePost setPinnedReplies={setPinnedReplies}>
        <div className="w-full">
            <div className={cn("py-3", pxToNumber(layoutConfig.maxWidthCenter) + 40 > width && "px-5")}>
                <ArticleHeader article={article}/>
                <div
                    className={"mt-8 mb-16"}
                    key={getEditorKey(article.uri, quoteReplies, article.editedAt)}
                >
                    <EditorWithQuoteComments
                        uri={article.uri}
                        cid={article.cid}
                        settings={getEditorSettings({
                            isReadOnly: true,
                            initialText: text,
                            initialTextFormat: format,
                            allowComments: true,
                            title: article.title,
                            tableOfContents: layoutConfig.spaceForRightSide,
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
            <div className={"py-2 px-1 border-b border-[var(--accent-dark)]"} id={"discusion"}>
                <EngagementIcons
                    content={article}
                    className={"flex px-[2px] w-full"}
                    enDiscusion={enDiscusion}
                    showDetails={true}
                    textClassName={"text-base font-light text-[var(--text)]"}
                />
            </div>
        </div>
    </ScrollToQuotePost>
}

export default Article