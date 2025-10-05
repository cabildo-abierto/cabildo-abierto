import {PostRecordEmbed} from "@/components/feed/embed/post-record-embed";
import {$Typed} from "@/lex-api/util";
import {AppBskyEmbedRecord} from "@atproto/api"
import {CAPostRecordEmbed} from "@/components/feed/embed/ca-post-record-embed";
import {ArCabildoabiertoEmbedRecord, ArCabildoabiertoFeedDefs} from "@/lex-api/index"


export function postViewToRecordEmbedView(post: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView>): $Typed<AppBskyEmbedRecord.View> {
    return {
        $type: "app.bsky.embed.record#view",
        record: {
            $type: "app.bsky.embed.record#viewRecord",
            uri: post.uri,
            cid: post.cid,
            author: {
                ...post.author,
                verification: null,
                $type: "app.bsky.actor.defs#profileViewBasic"},
            indexedAt: post.indexedAt,
            value: post.record,
        }
    }
}


export const WritePanelQuotedPost = ({quotedPost}: { quotedPost:  $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView> }) => {
    if(ArCabildoabiertoFeedDefs.isPostView(quotedPost)){
        const embed: AppBskyEmbedRecord.View = postViewToRecordEmbedView(quotedPost)
        return <div className={"pointer-events-none"}>
            <PostRecordEmbed
                embed={embed}
                navigateOnClick={false}
            />
        </div>
    } else if(ArCabildoabiertoFeedDefs.isArticleView(quotedPost) || ArCabildoabiertoFeedDefs.isFullArticleView(quotedPost)){
        const embed: ArCabildoabiertoEmbedRecord.View = {
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