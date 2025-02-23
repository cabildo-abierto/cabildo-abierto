"use client"

import {BskyRichTextContent} from "./bsky-rich-text-content";
import {FastPostImage} from "./fast-post-image";
import {QuotedPostFromEmbed} from "./quoted-post";
import {FastPostProps} from "../../app/lib/definitions";
import {ContentQuote, QuotedContent} from "./content-quote";
import {PlotInPost} from "./plot-in-post";
import {ExternalEmbedInPost} from "./external-embed-in-post";
import {FastPostVideo} from "./fast-post-video";


export const FastPostContent = ({post, isMainPost=false, hideQuote=false, showQuoteContext=false, onClickQuote}: {
    post: FastPostProps, isMainPost?: boolean, hideQuote?: boolean, showQuoteContext?: boolean, onClickQuote?: (cid: string) => void}) => {

    return <div className={"flex flex-col"}>
        {!hideQuote && post.content.post.replyTo && <div className={"pb-2 text-[14px]"}>
                <ContentQuote
                    post={post}
                    quotedContent={post.content.post.replyTo as QuotedContent}
                    quote={post.content.post.quote}
                    onClick={onClickQuote ? () => {onClickQuote(post.cid)} : undefined}
                    showContext={showQuoteContext}
                />
            </div>
        }
        <div className={isMainPost ? "text-lg" : undefined}>
            <BskyRichTextContent content={post.content}/>
        </div>
        <FastPostImage post={post} did={post.author.did}/>
        <FastPostVideo post={post}/>
        {post.content.post.embed && <QuotedPostFromEmbed embedStr={post.content.post.embed}/>}
        <PlotInPost post={post}/>
        <ExternalEmbedInPost post={post}/>
    </div>
}