"use client"
import {FastPostPreviewFrame} from './fast-post-preview-frame'
import ReadOnlyEditor from "@/components/editor/read-only-editor";
import {ArticleView, FeedViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {Record as ArticleRecord} from "@/lex-api/types/ar/cabildoabierto/feed/article"
import {PrettyJSON} from "../../../modules/ui-utils/src/pretty-json";


export type ArticlePreviewProps = {
    feedViewContent: FeedViewContent
    articleView: ArticleView
    repostedBy?: { displayName?: string, handle: string }
    showingChildren?: boolean
}


export const ArticlePreview = (
    {articleView, feedViewContent, showingChildren = false}: ArticlePreviewProps
) => {
    const article = articleView.record as ArticleRecord
    const summary = articleView.summary
    const title = article.title

    console.log("summary", summary)

    return <FastPostPreviewFrame postView={articleView} borderBelow={!showingChildren} showingChildren={showingChildren}>
        <div className={"border rounded-lg p-2 my-2 hover:bg-[var(--background-dark2)]"}>
            <div className={"text-sm text-[var(--text-light)]"}>
                Artículo
            </div>
            <div className={"font-bold text-lg pb-1"}>
                {title}
            </div>

            <div className={"border-t pt-1 text-sm text-[var(--text-light)] article-preview-content"}>
                <ReadOnlyEditor text={summary} format={"plain-text"}/>
            </div>
        </div>
    </FastPostPreviewFrame>
}