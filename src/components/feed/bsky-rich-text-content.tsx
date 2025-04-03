"use client"
import { RichText } from '@atproto/api'
import ReadOnlyEditor from '../editor/read-only-editor';


export const BskyRichTextContent = ({content, className="article-content not-article-content no-margin-first"}: {className?: string, content: {text: string, post?: {facets?: string}}}) => {
    const text = content.text

    if(!content.text || content.text.length == 0){
        return <></>
    }

    const rt = new RichText({
        text: text,
        facets: content.post && content.post.facets ? JSON.parse(content.post.facets) : undefined
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