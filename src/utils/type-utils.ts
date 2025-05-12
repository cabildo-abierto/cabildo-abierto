import {FullArticleView, PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs"
import {$Typed} from "@atproto/api";
import {ArticleView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {isMain} from "@/lex-api/types/ar/cabildoabierto/embed/selectionQuote";
import {TopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";

export function postOrArticle(content: any): content is $Typed<ArticleView> | $Typed<PostView> | $Typed<FullArticleView> {
    return content?.$type === 'ar.cabildoabierto.feed.defs#postView' ||
        content?.$type === 'ar.cabildoabierto.feed.defs#articleView' ||
        content?.$type === 'ar.cabildoabierto.feed.defs#fullArticleView'
}

export type ReplyRefContent = $Typed<ArticleView> | $Typed<PostView> | $Typed<FullArticleView> | $Typed<TopicViewBasic>

export function isReplyRefContent(content: any): content is ReplyRefContent {
    return content?.$type === 'ar.cabildoabierto.feed.defs#postView' ||
        content?.$type === 'ar.cabildoabierto.feed.defs#articleView' ||
        content?.$type === 'ar.cabildoabierto.feed.defs#fullArticleView' ||
        content?.$type === 'ar.cabildoabierto.wiki.topicVersion#topicViewBasic'
}

export const isSelectionQuote = isMain


