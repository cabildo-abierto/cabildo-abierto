import ReadOnlyEditor from '../../writing/read-only-editor';
import { AppBskyFeedPost } from '@atproto/api'
import {useMemo} from "react";
import {RichText} from "@atproto/api";


type BskyRichTextContentProps = {
    className?: string
    post: {text: string, facets?: AppBskyFeedPost.Record["facets"]}
    fontSize?: string
    namespace?: string
}


const BskyRichTextContent = ({
    post,
    fontSize = "16px",
    className = "no-margin-top article-content exclude-links not-article-content",
    namespace="namespace"
}: BskyRichTextContentProps) => {

    const markdown = useMemo(() => {
        const rt = new RichText({
            text: post.text,
            facets: post.facets
        })

        const segments = Array.from(rt.segments())

        let markdown = ''
        segments.forEach((segment) => {
            if (segment.isLink()) {
                markdown += `[${segment.text}](${segment.link?.uri})`
            } else if (segment.isMention()) {
                markdown += `[${segment.text}](/perfil/${segment.mention?.did})`
            } else {
                markdown += segment.text
            }
        })
        return markdown
    }, [post.text, post.facets])

    return <div style={{fontSize: fontSize}} className={className}>
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