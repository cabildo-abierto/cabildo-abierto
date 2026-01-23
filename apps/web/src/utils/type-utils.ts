import {$Typed, AppBskyFeedDefs} from "@atproto/api";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"

export function postOrArticle(content: any): content is $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView> {
    return content?.$type === 'ar.cabildoabierto.feed.defs#postView' ||
        content?.$type === 'ar.cabildoabierto.feed.defs#articleView' ||
        content?.$type === 'ar.cabildoabierto.feed.defs#fullArticleView'
}

export type ReplyRefContent = $Typed<ArCabildoabiertoFeedDefs.ArticleView> |
    $Typed<ArCabildoabiertoFeedDefs.PostView> |
    $Typed<ArCabildoabiertoFeedDefs.FullArticleView> |
    $Typed<ArCabildoabiertoWikiTopicVersion.TopicViewBasic> | $Typed<AppBskyFeedDefs.NotFoundPost> | $Typed<AppBskyFeedDefs.BlockedPost>

export function isReplyRefContent(content: any): content is ReplyRefContent {
    return content?.$type === 'ar.cabildoabierto.feed.defs#postView' ||
        content?.$type === 'ar.cabildoabierto.feed.defs#articleView' ||
        content?.$type === 'ar.cabildoabierto.feed.defs#fullArticleView' ||
        content?.$type === 'ar.cabildoabierto.wiki.topicVersion#topicViewBasic' ||
        content?.$type === 'app.bsky.feed.defs#notFoundPost' ||
        content?.$type === 'app.bsky.feed.defs#blockedPost'
}
