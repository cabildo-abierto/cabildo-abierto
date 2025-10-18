import {$Typed} from "@/lex-api/util";
import {PostRecordEmbed} from "@/components/feed/embed/post-record-embed";
import {ArCabildoabiertoEmbedRecord, ArCabildoabiertoFeedDefs} from "@/lex-api/index"


export function postViewToRecordEmbedView(post: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView>): ArCabildoabiertoEmbedRecord.View {
    return {
        $type: "ar.cabildoabierto.embed.record#view",
        record: {
            $type: "ar.cabildoabierto.embed.record#viewRecord",
            uri: post.uri,
            cid: post.cid,
            author: {
                ...post.author,
                $type: "ar.cabildoabierto.actor.defs#profileViewBasic"
            },
            indexedAt: post.indexedAt,
            value: post.record,
        }
    }
}


export const WritePanelQuotedPost = ({quotedPost}: {
    quotedPost: ArCabildoabiertoEmbedRecord.View["record"]
}) => {
    const embed: ArCabildoabiertoEmbedRecord.View = {
        $type: "ar.cabildoabierto.embed.record#view",
        record: quotedPost
    }
    return <div className={"pointer-events1-none"}>
        <PostRecordEmbed
            embed={embed}
            navigateOnClick={false}
        />
    </div>
}