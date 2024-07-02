import React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import 'ckeditor5/ckeditor5.css';

export default function ({content}) {
    return <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
}