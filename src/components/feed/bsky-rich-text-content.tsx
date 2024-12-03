
import { RichText } from '@atproto/api'
import {
    $convertFromMarkdownString,
    TRANSFORMERS,
} from '@lexical/markdown';
import { FeedContentProps } from '../../app/lib/definitions';
import ReadOnlyEditor from '../editor/read-only-editor';
import { LexicalEditor } from 'lexical';


export const BskyRichTextContent = ({content}: {content: FeedContentProps}) => {
    const text = content.record.text
    
    const rt = new RichText({
        text: text,
        facets: content.record.facets
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