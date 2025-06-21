import {
    ArticleView,
    FullArticleView,
    isArticleView,
    isFullArticleView,
    PostView
} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {PostRecordEmbed} from "@/components/feed/embed/post-record-embed";
import {View as RecordEmbedView} from "@/lex-api/types/app/bsky/embed/record"
import {$Typed} from "@atproto/api";
import {isPostView} from "@/lex-api/types/app/bsky/feed/defs";
import {isArticle} from "@/utils/uri";
import {CAPostRecordEmbed} from "@/components/feed/embed/ca-post-record-embed";
import {View as CARecordEmbedView} from "@/lex-api/types/ar/cabildoabierto/embed/record"


export function postViewToRecordEmbedView(post: $Typed<PostView> | $Typed<ArticleView> | $Typed<FullArticleView>): $Typed<RecordEmbedView> {
    return {
        $type: "app.bsky.embed.record#view",
        record: {
            $type: "app.bsky.embed.record#viewRecord",
            uri: post.uri,
            cid: post.cid,
            author: {...post.author, $type: "app.bsky.actor.defs#profileViewBasic"},
            indexedAt: post.indexedAt,
            value: post.record
        }
    }
}


export const WritePanelQuotedPost = ({quotedPost}: { quotedPost:  $Typed<PostView> | $Typed<ArticleView> | $Typed<FullArticleView> }) => {
    if(isPostView(quotedPost)){
        const embed: RecordEmbedView = postViewToRecordEmbedView(quotedPost)
        return <div className={"pointer-events-none"}>
            <PostRecordEmbed
                embed={embed}
                navigateOnClick={false}
            />
        </div>
    } else if(isArticleView(quotedPost) || isFullArticleView(quotedPost)){
        const embed: CARecordEmbedView = {
            $type: "ar.cabildoabierto.embed.record#view",
            record: quotedPost
        }
        return <div className={"pointer-events-none"}>
            <CAPostRecordEmbed
                embed={embed}
                navigateOnClick={false}
            />
        </div>
    }

}