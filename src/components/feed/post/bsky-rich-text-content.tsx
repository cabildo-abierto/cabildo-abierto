"use client"
import {RichText} from '@atproto/api'
import ReadOnlyEditor from '../../editor/read-only-editor';
import {PostRecord} from "@/lib/types";


type BskyRichTextContentProps = {
    className?: string
    post: PostRecord
}


export const BskyRichTextContent = ({
                                        post,
                                        className = "text-[16px] no-margin-top article-content not-article-content"
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

    return <ReadOnlyEditor text={markdown} format={"markdown"} editorClassName={className}/>
}