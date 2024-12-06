import {BskyRichTextContent} from "./bsky-rich-text-content";
import {BskyFastPostImage} from "./bsky-fast-post-image";
import {QuotedPost} from "./quoted-post";
import {FastPostProps} from "../../app/lib/definitions";


export const FastPostContent = ({post, isMainPost=false}: {post: FastPostProps, isMainPost?: boolean}) => {
    return <>
        <div className={isMainPost ? "text-lg" : undefined}>
            <BskyRichTextContent record={post.record}/>
        </div>
        <BskyFastPostImage content={post} did={post.author.did}/>
        <QuotedPost content={post}/>
    </>
}