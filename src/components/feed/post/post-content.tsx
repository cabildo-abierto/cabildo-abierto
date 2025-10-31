import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {PostEmbed} from "@/components/feed/embed/post-embed";
import BskyRichTextContent from "@/components/feed/post/bsky-rich-text-content";
import {AppBskyFeedPost} from "@atproto/api";
import {useMemo} from "react";

type PostContentProps = {
    postView: ArCabildoabiertoFeedDefs.PostView
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

    const content = useMemo(() => {
        return <BskyRichTextContent
            post={postView.record as AppBskyFeedPost.Record}
            fontSize={isMainPost ? "18px" : hideQuote ? "14px" : "16px"}
            className={"no-margin-top article-content not-article-content exclude-links"}
            namespace={postView.uri}
            editedAt={postView.editedAt}
        />
    }, [postView.record, postView.uri, postView.editedAt, hideQuote, isMainPost])

    const embed = useMemo(() => {
        if(postView.embed) {
            return <PostEmbed
                embed={postView.embed}
                mainPostRef={{uri: postView.uri, cid: postView.cid}}
                hideSelectionQuote={hideQuote}
                onClickSelectionQuote={onClickQuote}
                showContext={showQuoteContext}
            />
        }
    }, [postView.embed, postView.uri, postView.cid, hideQuote, onClickQuote, showQuoteContext])

    return <div className={"flex flex-col space-y-2"}>
        {content}
        {embed}
    </div>
}