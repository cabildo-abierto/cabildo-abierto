import {ReasonRepost} from "@/lex-api/types/app/bsky/feed/defs";
import {FullArticleView, PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs"
import {$Typed} from "@atproto/api";
import {ArticleView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {isMain} from "@/lex-api/types/ar/cabildoabierto/embed/selectionQuote";

export function isKnownContent(content: any): content is $Typed<ArticleView> | $Typed<PostView> | $Typed<FullArticleView> {
    return content?.$type === 'ar.cabildoabierto.feed.defs#postView' || content?.$type === 'ar.cabildoabierto.feed.defs#articleView' || content?.$type === 'ar.cabildoabierto.feed.defs#fullArticleView';
}

export const isSelectionQuote = isMain


