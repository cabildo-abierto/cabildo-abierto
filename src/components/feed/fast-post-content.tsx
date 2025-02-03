"use client"

import {BskyRichTextContent} from "./bsky-rich-text-content";
import {FastPostImage} from "./fast-post-image";
import {QuotedPostFromEmbed} from "./quoted-post";
import {FastPostProps} from "../../app/lib/definitions";
import {ContentQuote} from "./content-quote";
import {PlotInPost} from "./plot-in-post";
import {ExternalEmbedInPost} from "./external-embed-in-post";
import {FastPostVideo} from "./fast-post-video";


export const FastPostContent = ({post, isMainPost=false, hideQuote=false, onClickQuote}: {post: FastPostProps, isMainPost?: boolean, hideQuote?: boolean, onClickQuote?: (cid: string) => void}) => {
    return <>
        {!hideQuote && post.content.post.replyTo && <ContentQuote post={post} onClick={() => {onClickQuote(post.cid)}}/>}
        <div className={isMainPost ? "text-lg" : undefined}>
            <BskyRichTextContent content={post.content}/>
        </div>
        <FastPostImage post={post} did={post.author.did}/>
        <FastPostVideo post={post}/>
        {post.content.post.embed && <QuotedPostFromEmbed embedStr={post.content.post.embed}/>}
        <PlotInPost post={post}/>
        <ExternalEmbedInPost post={post}/>
    </>
}