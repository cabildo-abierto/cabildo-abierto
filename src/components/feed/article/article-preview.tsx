"use client"
import {PostPreviewFrame} from '../frame/post-preview-frame'
import ReadOnlyEditor from "@/components/editor/read-only-editor";
import {ArticleView, FeedViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {Record as ArticleRecord} from "@/lex-api/types/ar/cabildoabierto/feed/article"
import {$Typed} from "@atproto/api";
import {Color, darker} from "@/../modules/ui-utils/src/button"

export type ArticlePreviewProps = {
    feedViewContent: FeedViewContent
    articleView: $Typed<ArticleView>
    repostedBy?: { displayName?: string, handle: string }
    showingChildren?: boolean
}


export const ArticlePreviewContent = ({color = "background", title, summary, clickable = true}: {
    color?: Color,
    clickable?: boolean,
    title: string,
    summary: string
}) => {
    return <div className={`border rounded-lg p-2 my-2 bg-[${color}] hover:bg-[${darker(darker(color))}]`}>
        <div className={"text-sm text-[var(--text-light)]"}>
            Artículo
        </div>
        <div className={"font-bold text-lg pb-1"}>
            {title}
        </div>

        <div className={"border-t pt-1 text-sm text-[var(--text-light)] article-preview-content line-clamp-2"}>
            <ReadOnlyEditor text={summary} format={"plain-text"}/>
        </div>
    </div>
}


export const ArticlePreview = (
    {articleView, feedViewContent, showingChildren = false}: ArticlePreviewProps
) => {
    const article = articleView.record as ArticleRecord
    const summary = articleView.summary
    const title = article.title

    return <PostPreviewFrame postView={articleView} borderBelow={!showingChildren} showingChildren={showingChildren}>
        <ArticlePreviewContent title={title} summary={summary}/>
    </PostPreviewFrame>
}