import ReadOnlyEditor from '../../writing/read-only-editor';
import { AppBskyFeedPost } from '@atproto/api'
import {useMarkdownFromBsky} from "@/components/writing/write-panel/use-markdown-from-bsky";


type BskyRichTextContentProps = {
    className?: string
    post: {text: string, facets?: AppBskyFeedPost.Record["facets"]}
    fontSize?: string
    namespace?: string
    editedAt?: string
}


const BskyRichTextContent = ({
    post,
    fontSize = "16px",
    className = "no-margin-top article-content exclude-links not-article-content",
    namespace="namespace",
    editedAt
}: BskyRichTextContentProps) => {
    const {markdown} = useMarkdownFromBsky(post)

    return <div style={{fontSize: fontSize}} className={className} key={editedAt}>
        <ReadOnlyEditor
            text={markdown.replaceAll("\n", "\n\n")}
            format={"markdown"}
            shouldPreserveNewLines={true}
            editorClassName={""}
            namespace={namespace}
        />
    </div>
}


export default BskyRichTextContent