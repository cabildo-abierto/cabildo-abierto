import {BskyRichTextContent} from "./bsky-rich-text-content";
import {FeedViewContent, PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {isSelectionQuote} from "@/utils/type-utils";
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

    return <div className={"flex flex-col"}>
        <div className={isMainPost ? "text-lg" : undefined}>
            <BskyRichTextContent post={postView.record as PostRecord}/>
        </div>
        {embed && <PostEmbed
            embed={postView.embed}
            mainPostRef={{uri: postView.uri, cid: postView.cid}}
            hideSelectionQuote={hideQuote}
            onClickSelectionQuote={onClickQuote}
            showContext={showQuoteContext}
        />}
    </div>
}