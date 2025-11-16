import {$Typed} from "@atproto/api";
import {ReactionType} from "#/services/reactions/reactions.js";
import {
    ArCabildoabiertoFeedDefs
} from "@cabildo-abierto/api"

export function isKnownContent(content: any): content is $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView> {
    return content?.$type === 'ar.cabildoabierto.feed.defs#postView' ||
        content?.$type === 'ar.cabildoabierto.feed.defs#articleView' ||
        content?.$type === 'ar.cabildoabierto.feed.defs#fullArticleView';
}


export function isReactionCollection(c: string): c is ReactionType {
    return [
        "app.bsky.feed.like",
        "app.bsky.feed.repost",
        "ar.cabildoabierto.wiki.voteAccept",
        "ar.cabildoabierto.wiki.voteReject"
    ].includes(c)
}
