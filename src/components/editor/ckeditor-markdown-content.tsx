import Markdown from "react-markdown"

import 'ckeditor5/ckeditor5.css';

import remarkGfm from 'remark-gfm'

export default function MarkdownContent({content}: {content: string}) {
    return <div className="editor-container ck-content">
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
}