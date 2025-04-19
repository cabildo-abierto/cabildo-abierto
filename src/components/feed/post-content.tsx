"use client"

import {BskyRichTextContent} from "./bsky-rich-text-content";
import {ContentQuote} from "./content-quote";
import {FeedViewContent, PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {isSelectionQuote} from "@/utils/type-utils";
import {PostRecord} from "@/lib/definitions";
import {PostEmbed} from "@/components/feed/embed/post-embed";


type PostContentProps = {
    postView: PostView
    feedViewContent: FeedViewContent
    isMainPost?: boolean
    hideQuote?: boolean
    showQuoteContext?: boolean
    onClickQuote?: (cid: string) => void
}


export const PostContent = ({
                                    postView,
                                    feedViewContent,
                                    isMainPost = false,
                                    hideQuote = false,
                                    showQuoteContext = false,
                                    onClickQuote
                                }: PostContentProps) => {

    const embed = postView.embed

    return <div className={"flex flex-col"}>
        {!hideQuote && postView.embed && isSelectionQuote(postView.embed) &&
            <div className={"pb-2 text-[14px]"}>
                <ContentQuote
                    postView={postView}
                    quotedContent={feedViewContent.reply.parent}
                    quote={postView.embed}
                    onClick={onClickQuote ? () => {
                        onClickQuote(postView.uri)
                    } : undefined}
                    showContext={showQuoteContext}
                />
            </div>
        }
        <div className={isMainPost ? "text-lg" : undefined}>
            <BskyRichTextContent post={postView.record as PostRecord}/>
        </div>
        {embed && <PostEmbed embed={postView.embed}/>}
    </div>
}