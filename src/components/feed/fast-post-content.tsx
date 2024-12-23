import {BskyRichTextContent} from "./bsky-rich-text-content";
import {BskyFastPostImage} from "./bsky-fast-post-image";
import {QuotedPost} from "./quoted-post";
import {FastPostProps} from "../../app/lib/definitions";
import {ContentQuote} from "./content-quote";


export const FastPostContent = ({post, isMainPost=false, hideQuote=false, onClickQuote}: {post: FastPostProps, isMainPost?: boolean, hideQuote?: boolean, onClickQuote?: () => void}) => {
    return <>
        {!hideQuote && post.content.post.replyTo && <ContentQuote post={post} onClick={onClickQuote}/>}
        <div className={isMainPost ? "text-lg" : undefined}>
            <BskyRichTextContent content={post.content}/>
        </div>
        <BskyFastPostImage post={post} did={post.author.did}/>
        <QuotedPost post={post}/>
    </>
}