"use client"
import {RichText} from '@atproto/api'
import ReadOnlyEditor from '../../editor/read-only-editor';
import {PostRecord} from "@/lib/types";


type BskyRichTextContentProps = {
    className?: string
    post: {text: string, facets?: PostRecord["facets"]}
    fontSize?: string
    namespace?: string
}


export const BskyRichTextContent = ({
    post,
    fontSize = "16px",
    className = "no-margin-top article-content exclude-links not-article-content",
    namespace="namespace"
}: BskyRichTextContentProps) => {
    const text: string = post.text
    const facets = post.facets

    if (!text || text.length == 0) {
        return <></>
    }

    const rt = new RichText({
        text: text,
        facets: facets
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