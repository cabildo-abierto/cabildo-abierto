import { useState, useEffect, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import coreTranslations from 'ckeditor5/translations/es.js';

import {
	BalloonEditor,
	AccessibilityHelp,
	Autoformat,
	Autosave,
	BlockQuote,
	BlockToolbar,
	Bold,
	Essentials,
	Heading,
	HorizontalLine,
	Italic,
	Link,
	Paragraph,
	SelectAll,
	SpecialCharacters,
	SpecialCharactersArrows,
	SpecialCharactersCurrency,
	SpecialCharactersEssentials,
	SpecialCharactersLatin,
	SpecialCharactersMathematical,
	SpecialCharactersText,
	Strikethrough,
	Table,
	TableCaption,
	TableCellProperties,
	TableColumnResize,
	TableProperties,
	TableToolbar,
	Title,
	Underline,
	Undo,
	Mention
} from 'ckeditor5';

import { headingConfig, linkConfig, mentionConfig, MentionCustomization, tableConfig } from './markdown-editor';
import "./editor.css"

import InternalLink from "./link/link"

const plugins = [
	AccessibilityHelp,
	Autoformat,
	Autosave,
	BlockQuote,
	BlockToolbar,
	Bold,
	Essentials,
	Heading,
	HorizontalLine,
	Italic,
	Link,
	Mention,
	InternalLink,
	MentionCustomization,
	Paragraph,
	SelectAll,
	SpecialCharacters,
	SpecialCharactersArrows,
	SpecialCharactersCurrency,
	SpecialCharactersEssentials,
	SpecialCharactersLatin,
	SpecialCharactersMathematical,
	SpecialCharactersText,
	Strikethrough,
	Table,
	TableCaption,
	TableCellProperties,
	TableColumnResize,
	TableProperties,
	TableToolbar,
	Title,
	Underline,
	Undo
]


const toolbar = {
	items: [
		'undo',
		'redo',
		'|',
		'selectAll',
		'|',
		'heading',
		'|',
		'bold',
		'italic',
		'underline',
		'strikethrough',
		'|',
		'specialCharacters',
		'horizontalLine',
		'link',
		'internal-link',
		'insertTable',
		'blockQuote',
	],
	shouldNotGroupWhenFull: false
}


export default function PostEditor({onSubmit, onSaveDraft, initialData=""}) {
    const [editor, setEditor] = useState(null);
	const editorRef = useRef(null);
	const editorContainerRef = useRef(null);
	const [isLayoutReady, setIsLayoutReady] = useState(false);

	useEffect(() => {
		setIsLayoutReady(true);

		return () => setIsLayoutReady(false);
	}, []);

	const editorConfig = {
		toolbar: toolbar,
        title: {placeholder: 'Título'},
		plugins: plugins,
		mention: mentionConfig,
		blockToolbar: ['bold', 'italic', '|', 'link', 'internal-link', 'insertTable'],
		heading: headingConfig,
		initialData: initialData,
		link: linkConfig,
		placeholder: 'Tu publicación va acá',
		table: tableConfig,
        translations: [coreTranslations]
	};

	return (
		<div className="editor-container" ref={editorContainerRef}>
            <div className="editor-container__editor ck-content">
				<div ref={editorRef} className="">
					{isLayoutReady && 
						<CKEditor
							editor={BalloonEditor}
							config={editorConfig}
							onReady={setEditor}
					/>}

					<div className="flex justify-end mt-3">
						<div className="px-2">
						<button
							onClick={() => {onSaveDraft(editor.getData())}}
							className="py-2 px-4 rounded font-bold transition duration-200 bg-red-500 hover:bg-red-600 text-white cursor-pointer"
						>
							Guardar borrador
						</button>
						</div>
						<div>
							<button
								onClick={() => {onSubmit(editor.getData())}}
								className="py-2 px-4 rounded font-bold transition duration-200 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
							>
								Publicar
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
