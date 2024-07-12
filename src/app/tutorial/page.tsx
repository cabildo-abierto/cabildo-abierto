"use client"

import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor } from 'ckeditor5';

import { Essentials, Paragraph } from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import { useEffect, useRef, useState } from 'react';

import { Highlight } from './plugin';

import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

export default function Page() {
    const [editor, setEditor] = useState(null);
	const editorRef = useRef(null);

    const editorConfig = {
        plugins: [
            Essentials,
            Paragraph,
            Highlight
        ],
        toolbar: {
            items: [
                'undo',
                'redo',
                'highlight'
            ]
        }
    }

    return <>
        <div ref={editorRef} className="">
            <CKEditor
                editor={ClassicEditor}
                config={editorConfig}
                onReady={(editor) => {
                    CKEditorInspector.attach(editor)
                    window.editor = editor;
                    setEditor(editor);
                }}
            />
        </div>
    </>
}

