import {ReasonRepost} from "@/lex-api/types/app/bsky/feed/defs";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs"
import {$Typed} from "@atproto/api";
import {ArticleView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {isMain} from "@/lex-api/types/ar/cabildoabierto/embed/selectionQuote";

export function isPostView(content: any): content is $Typed<PostView> {
    return content?.$type === 'ar.cabildoabierto.feed.defs#postView';
}

export function isArticleView(content: any): content is $Typed<ArticleView> {
    return content?.$type === 'ar.cabildoabierto.feed.defs#articleView';
}

export function isReasonRepost(reason: any): reason is $Typed<ReasonRepost> {
    return reason?.$type === 'app.bsky.feed.defs#reasonRepost';
}

export function isKnownContent(content: any): content is $Typed<ArticleView> | $Typed<PostView> {
    return content?.$type === 'ar.cabildoabierto.feed.defs#postView' || content?.$type === 'ar.cabildoabierto.feed.defs#articleView';
}

export const isSelectionQuote = isMain


