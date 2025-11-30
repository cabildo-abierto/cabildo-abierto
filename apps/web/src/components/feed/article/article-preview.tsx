import {PostPreviewFrame} from '../utils/post-preview-frame'
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api";
import {$Typed, AppBskyFeedDefs} from "@atproto/api";
import {ArCabildoabiertoFeedArticle} from "@cabildo-abierto/api"
import {ArticleOrExternalPreview} from "@/components/feed/article/article-or-external-preview";
import {contentUrl} from "@cabildo-abierto/utils";


export type ArticlePreviewProps = {
    feedViewContent: ArCabildoabiertoFeedDefs.FeedViewContent
    articleView: $Typed<ArCabildoabiertoFeedDefs.ArticleView>
    repostedBy?: { displayName?: string, handle: string }
    showingChildren?: boolean
}


export const ArticlePreviewContent = ({
                                          title,
                                          summary,
    image,
    onClick,
    uri
                                      }: {
    title: string,
    summary: string
    image?: string
    onClick?: () => void
    uri?: string
}) => {
    return <ArticleOrExternalPreview
        isArticle={true}
        description={summary}
        thumb={image}
        title={title}
        onClick={onClick}
        url={uri ? contentUrl(uri) : undefined}
    />
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
            <ArticlePreviewContent
                title={title}
                summary={summary}
                image={articleView.preview?.thumb}
                uri={articleView.uri}
            />
        </div>
    </PostPreviewFrame>
}