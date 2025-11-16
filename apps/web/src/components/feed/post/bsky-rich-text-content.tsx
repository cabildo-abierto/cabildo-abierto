import { AppBskyFeedPost } from '@atproto/api'
import {useMarkdownFromBsky} from "../../writing/write-panel/use-markdown-from-bsky";
import {ReadOnlyEditor} from "@/components/utils/base/read-only-editor";


type BskyRichTextContentProps = {
    className?: string
    post: {text: string, facets?: AppBskyFeedPost.Record["facets"]}
    fontSize?: string
    editedAt?: string
}


const BskyRichTextContent = ({
    post,
    fontSize = "16px",
    className = "no-margin-top article-content exclude-links not-article-content",
    editedAt
}: BskyRichTextContentProps) => {
    const {markdown} = useMarkdownFromBsky(post)

    return <div
        style={{fontSize: fontSize}}
        className={className}
        key={editedAt}
    >
        <ReadOnlyEditor
            text={markdown.replaceAll("\n", "\n\n")}
        />
    </div>
}


export default BskyRichTextContent