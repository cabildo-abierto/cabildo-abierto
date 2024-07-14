"use client"

import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor } from 'ckeditor5';

import { Essentials, Paragraph } from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import { useEffect, useRef, useState } from 'react';

import Abbreviation from './abbreviation/abbreviation';
import Link from './link/link'

import CKEditorInspector from '@ckeditor/ckeditor5-inspector'

export default function Editor() {
    const [editor, setEditor] = useState(null);
	const editorRef = useRef(null);
	const [isLayoutReady, setIsLayoutReady] = useState(false);

    useEffect(() => {
		setIsLayoutReady(true);

		return () => setIsLayoutReady(false);
	}, []);

    const editorConfig = {
        plugins: [
            Essentials,
            Paragraph,
            Abbreviation,
            Link
        ],
        toolbar: [
            'undo',
            'redo',
            'abbreviation',
            'link'
        ]
    }

    return <>
		<div ref={editorRef} className="">{isLayoutReady && 
		<CKEditor
			editor={ClassicEditor}
			config={editorConfig}
            onReady={(editor) => {
                CKEditorInspector.attach(editor)
                window.editor = editor;
                setEditor(editor);
            }}
		/>}
        </div>
    </>
}

