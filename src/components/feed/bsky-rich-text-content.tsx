"use client"
import { RichText } from '@atproto/api'
import {
    $convertFromMarkdownString,
    TRANSFORMERS,
} from '@lexical/markdown';
import ReadOnlyEditor from '../editor/read-only-editor';
import { LexicalEditor } from 'lexical';


export const BskyRichTextContent = ({content}: {content: {text: string, post?: {facets?: string}}}) => {
    const text = content.text
    
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

    const initialData = (editor: LexicalEditor) => {$convertFromMarkdownString(markdown, TRANSFORMERS)}

    return <ReadOnlyEditor initialData={initialData}/>
}