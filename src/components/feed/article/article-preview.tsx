"use client"
import {PostPreviewFrame} from '../frame/post-preview-frame'
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index";
import {$Typed} from "@/lex-api/util";
import {darker} from "@/../modules/ui-utils/src/button"
import {Box} from "@mui/material";
import {AppBskyFeedDefs} from "@atproto/api";
import ReadOnlyEditor from "@/components/writing/read-only-editor";
import {ArCabildoabiertoFeedArticle} from "@/lex-api/index"
import {Color} from "../../../../modules/ui-utils/src/color";


export type ArticlePreviewProps = {
    feedViewContent: ArCabildoabiertoFeedDefs.FeedViewContent
    articleView: $Typed<ArCabildoabiertoFeedDefs.ArticleView>
    repostedBy?: { displayName?: string, handle: string }
    showingChildren?: boolean
}


export const ArticlePreviewContent = ({
                                          color = "background",
                                          title,
                                          summary,
                                          mentions,
                                          clickable = true
                                      }: {
    color?: Color
    clickable?: boolean,
    title: string,
    summary: string
    mentions?: ArCabildoabiertoFeedDefs.TopicMention[]
}) => {
    return <Box
        className={"border p-2"}
        sx={{
            backgroundColor: `var(--${color})`,
            "&:hover": {
                backgroundColor: clickable ? `var(--${darker(color)})` : undefined
            }
        }}
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
            <ReadOnlyEditor text={summary} format={"plain-text"}/>
        </div>
    </Box>
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
            <ArticlePreviewContent title={title} summary={summary} color={"transparent"}/>
        </div>
    </PostPreviewFrame>
}