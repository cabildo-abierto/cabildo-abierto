"use client"
import {PostPreviewFrame} from '../frame/post-preview-frame'
import ReadOnlyEditor from "@/components/editor/read-only-editor";
import {ArticleView, FeedViewContent, TopicMention} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {Record as ArticleRecord} from "@/lex-api/types/ar/cabildoabierto/feed/article"
import {$Typed} from "@atproto/api";
import {Color, darker} from "@/../modules/ui-utils/src/button"
import {Box} from "@mui/material";
import {isReasonRepost} from "@/lex-api/types/app/bsky/feed/defs";


export type ArticlePreviewProps = {
    feedViewContent: FeedViewContent
    articleView: $Typed<ArticleView>
    repostedBy?: { displayName?: string, handle: string }
    showingChildren?: boolean
}


export const ArticlePreviewContent = ({
                                          color = "background", title, summary, mentions, clickable = true}: {
    color?: Color
    clickable?: boolean,
    title: string,
    summary: string
    mentions?: TopicMention[]
}) => {
    return <Box
        className={"border rounded-lg p-2"}
        sx={{
            backgroundColor: `var(--${color})`,
            "&:hover": {
                backgroundColor: clickable ? `var(--${darker(color)})` : undefined
            }
        }}
    >
        <div className={"flex justify-between w-full"}>
            <div className={"text-sm text-[var(--text-light)]"}>
                Artículo
            </div>
        </div>
        <div className={"font-bold text-lg pb-1"}>
            {title}
        </div>
        <div className={"border-t pt-1 text-sm text-[var(--text-light)] article-preview-content line-clamp-2"}>
            <ReadOnlyEditor text={summary} format={"plain-text"}/>
        </div>
    </Box>
}


export const ArticlePreview = (
    {articleView, feedViewContent, showingChildren = false}: ArticlePreviewProps
) => {
    const article = articleView.record as ArticleRecord
    const summary = articleView.summary
    const title = article.title
    const reason = feedViewContent && feedViewContent.reason && isReasonRepost(feedViewContent.reason) ? feedViewContent.reason : undefined

    return <PostPreviewFrame
        postView={articleView}
        borderBelow={!showingChildren}
        showingChildren={showingChildren}
        reason={reason}
    >
        <div className={"mt-2"}>
            <ArticlePreviewContent title={title} summary={summary} color={"transparent"}/>
        </div>
    </PostPreviewFrame>
}