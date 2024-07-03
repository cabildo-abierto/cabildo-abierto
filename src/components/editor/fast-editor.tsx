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
	Undo
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import "./editor.css"

export default function FastEditor({onSubmit}) {
    const [editor, setEditor] = useState(null);
	const editorContainerRef = useRef(null);
	const editorRef = useRef(null);
	const [isLayoutReady, setIsLayoutReady] = useState(false);

	useEffect(() => {
		setIsLayoutReady(true);

		return () => setIsLayoutReady(false);
	}, []);

	const editorConfig = {
		toolbar: {
			items: [
				'undo',
				'redo',
				'|',
				'selectAll',
				'|',
				'bold',
				'italic',
				'underline',
				'strikethrough',
				'|',
				'specialCharacters',
				'horizontalLine',
				'link',
				'blockQuote',
			],
			shouldNotGroupWhenFull: false
		},
		plugins: [
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
			Underline,
			Undo
		],
		blockToolbar: ['bold', 'italic', '|', 'link', 'insertTable'],
		initialData:
			'',
		link: {
			addTargetToExternalLinks: true,
			defaultProtocol: 'https://',
			decorators: {
				toggleDownloadable: {
					mode: 'manual',
					label: 'Downloadable',
					attributes: {
						download: 'file'
					}
				}
			}
		},
		placeholder: '...',
        translations: [
            coreTranslations
        ]
	};

	return (
		<div ref={editorRef} className="ml-4">
			{isLayoutReady && 
			<CKEditor
				editor={BalloonEditor}
				config={editorConfig}
				onReady={setEditor}
			/>}
		
			<div className="flex justify-end mt-3">
			<button
				onClick={() => {onSubmit(editor.getData())}}
				className="py-2 px-4 rounded font-bold transition duration-200 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
			>
				Publicar
			</button>
			</div>
		</div>
	);
}
