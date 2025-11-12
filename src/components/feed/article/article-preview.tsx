"use client"
import {PostPreviewFrame} from '../frame/post-preview-frame'
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index";
import {$Typed} from "@/lex-api/util";
import {AppBskyFeedDefs} from "@atproto/api";
import ReadOnlyEditor from "@/components/writing/read-only-editor";
import {ArCabildoabiertoFeedArticle} from "@/lex-api/index"
import {cn} from "@/lib/utils";
import {ImagePayload} from "@/components/writing/write-panel/write-post";
import Image from "next/image"


export type ArticlePreviewProps = {
    feedViewContent: ArCabildoabiertoFeedDefs.FeedViewContent
    articleView: $Typed<ArCabildoabiertoFeedDefs.ArticleView>
    repostedBy?: { displayName?: string, handle: string }
    showingChildren?: boolean
}


export const ArticlePreviewContent = ({
                                          thumbnail,
                                          title,
                                          summary,
                                          className
                                      }: {
    thumbnail?: ImagePayload
    title: string,
    summary: string
    className?: string
}) => {
    return <div
        className={cn("border", className)}
    >
        {thumbnail && thumbnail.$type == "file" && <div>
            <Image
                src={thumbnail.src}
                alt={""}
                width={500}
                height={500}
            />
        </div>}
        <div className={"p-2"}>
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