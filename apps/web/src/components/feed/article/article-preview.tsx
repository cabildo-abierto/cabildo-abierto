"use client"
import {PostPreviewFrame} from '../utils/post-preview-frame'
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api";
import {$Typed, AppBskyFeedDefs} from "@atproto/api";
import {ArCabildoabiertoFeedArticle} from "@cabildo-abierto/api"
import {cn} from "@/lib/utils";
import {ReadOnlyEditor} from "@/components/utils/base/read-only-editor";


export type ArticlePreviewProps = {
    feedViewContent: ArCabildoabiertoFeedDefs.FeedViewContent
    articleView: $Typed<ArCabildoabiertoFeedDefs.ArticleView>
    repostedBy?: { displayName?: string, handle: string }
    showingChildren?: boolean
}


export const ArticlePreviewContent = ({
                                          title,
                                          summary,
                                          className
                                      }: {
    title: string,
    summary: string
    className?: string
}) => {
    return <div
        className={cn("border p-2", className)}
    >
        <div className={"flex justify-between w-full"}>
            <div className={"text-[11px] text-[var(--text-light)] uppercase"}>
                Artículo
            </div>
        </div>
        <div className={"font-bold text-lg pb-1"}>
            {title}
        </div>
        <div className={"border-t pt-1 text-sm text-[var(--text-light)] article-preview-content line-clamp-2"}>
            <ReadOnlyEditor text={summary}/>
        </div>
    </div>
}


export const ArticlePreview = (
    {articleView, feedViewContent, showingChildren = false}: ArticlePreviewProps
) => {
    const article = articleView.record as ArCabildoabiertoFeedArticle.Record
    const summary = articleView.summary
    const title = article.title
    const reason = feedViewContent && feedViewContent.reason && AppBskyFeedDefs.isReasonRepost(feedViewContent.reason) ? feedViewContent.reason : undefined

    return <PostPreviewFrame
        postView={articleView}
        borderBelow={!showingChildren}
        showingChildren={showingChildren}
        reason={reason}
    >
        <div className={"mt-2"}>
            <ArticlePreviewContent title={title} summary={summary}/>
        </div>
    </PostPreviewFrame>
}