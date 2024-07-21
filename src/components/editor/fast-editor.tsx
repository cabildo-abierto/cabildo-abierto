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
	Underline,
	Undo,
	Mention
} from 'ckeditor5';

import { linkConfig, mentionConfig, MentionCustomization } from './markdown-editor';
import "./editor.css"
import InternalLink from "./link/link"
import { validFastPost } from '@/app/escribir/page';


export const fastEditorPlugins = [
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
	InternalLink,
	Mention,
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
	Underline,
	Undo
]


export const fastEditorBlockToolbar = ['bold', 'italic', '|', 'link', 'internal-link']


export default function FastEditor({onSubmit, onSaveDraft, initialData=""}) {
    const [editor, setEditor] = useState(null);
	const editorRef = useRef(null);
	const editorContainerRef = useRef(null);
	const [validContent, setValidContent] = useState(false)
	const [isLayoutReady, setIsLayoutReady] = useState(false);

	useEffect(() => {
		setIsLayoutReady(true);

		return () => setIsLayoutReady(false);
	}, []);

	const editorConfig = {
		plugins: fastEditorPlugins,
		balloonToolbar: fastEditorBlockToolbar,
		initialData: initialData,
		link: linkConfig,
		placeholder: '...',
        translations: [coreTranslations],
		language: 'es',
		mention: mentionConfig,
	};


	return <div className="editor-container editor-container_classic-editor editor-container_include-block-toolbar" ref={editorContainerRef}>
		<div className="editor-container__editor">
			<div ref={editorRef} className="">
				{isLayoutReady && 
				<CKEditor
					editor={BalloonEditor}
					config={editorConfig}
					onReady={setEditor}
					onChange={(e) => {setValidContent(validFastPost(editor.getData()))}}
				/>}
	
				<div className="flex justify-end mt-3">
					<div className="px-2">
						<button
							onClick={() => {onSaveDraft(editor.getData())}}
							disabled={!validContent}
							className="py-2 px-4 rounded font-bold transition duration-200 bg-red-500 hover:bg-red-600 text-white enabled:cursor-pointer disabled:bg-gray-400"
						>
							Guardar borrador
						</button>
						</div>
						<div>
							<button
								onClick={() => {onSubmit(editor.getData())}}
								disabled={!validContent}
								className="py-2 px-4 rounded font-bold transition duration-200 bg-blue-500 hover:bg-blue-600 text-white enabled:cursor-pointer disabled:bg-gray-400"
							>
								Publicar
							</button>
					</div>
				</div>
			</div>
		</div>
	</div>
}
