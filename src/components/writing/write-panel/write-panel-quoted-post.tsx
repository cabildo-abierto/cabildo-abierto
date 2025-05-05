import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {PostRecordEmbed} from "@/components/feed/embed/post-record-embed";
import {View as RecordEmbedView} from "@/lex-api/types/app/bsky/embed/record"
import {$Typed} from "@atproto/api";


export function postViewToRecordEmbedView(post: PostView): $Typed<RecordEmbedView> {
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


export const WritePanelQuotedPost = ({quotedPost}: { quotedPost: PostView }) => {
    const embed: RecordEmbedView = postViewToRecordEmbedView(quotedPost)

    return <div className={"pointer-events-none"}>
        <PostRecordEmbed
            embed={embed}
            navigateOnClick={false}
        />
    </div>
}