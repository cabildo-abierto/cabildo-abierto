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

export default function CommentEditor({onSubmit, onCancel}) {
    const [editor, setEditor] = useState(null);
	const editorRef = useRef(null);
	const [isLayoutReady, setIsLayoutReady] = useState(false);

	useEffect(() => {
		setIsLayoutReady(true);

		return () => setIsLayoutReady(false);
	}, []);

	const editorConfig = {
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
		initialData: '',
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

	function handleSubmit(){
		const data = editor.getData()
		if(data.length == 0) return
		onSubmit(data)
	}

	return <div ref={editorRef} className="">
		{isLayoutReady && 
		<CKEditor
			editor={BalloonEditor}
			config={editorConfig}
			onReady={setEditor}
		/>}


		<div className="flex justify-end">
			<div className="flex justify-end mt-3">
				<div className="px-1">
					<button
						onClick={handleSubmit}
						className="mr-2 text-gray-600 text-sm hover:text-gray-800"
					>
						Enviar
					</button>
				</div>
				<div className="px-1">
					<button
						onClick={onCancel}
						className="mr-2 text-gray-600 text-sm hover:text-gray-800"
					>
						Cancelar
					</button>
				</div>
			</div>
		</div>
	</div>
}
