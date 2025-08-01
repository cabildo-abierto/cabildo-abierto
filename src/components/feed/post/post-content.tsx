import {BskyRichTextContent} from "./bsky-rich-text-content";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {PostRecord} from "@/lib/types";
import {PostEmbed} from "@/components/feed/embed/post-embed";


type PostContentProps = {
    postView: PostView
    isMainPost?: boolean
    hideQuote?: boolean
    showQuoteContext?: boolean
    onClickQuote?: (cid: string) => void
}


export const PostContent = ({
    postView,
    isMainPost = false,
    hideQuote = false,
    showQuoteContext = false,
    onClickQuote
}: PostContentProps) => {

    const embed = postView.embed

    return <div className={"flex flex-col space-y-2"}>
        <BskyRichTextContent
            post={postView.record as PostRecord}
            fontSize={isMainPost ? "18px" : "16px"}
            className={"no-margin-top article-content not-article-content exclude-links"}
        />
        {embed && <PostEmbed
            embed={embed}
            mainPostRef={{uri: postView.uri, cid: postView.cid}}
            hideSelectionQuote={hideQuote}
            onClickSelectionQuote={onClickQuote}
            showContext={showQuoteContext}
        />}
    </div>
}