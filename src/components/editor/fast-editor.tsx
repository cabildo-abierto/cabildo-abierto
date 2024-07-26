"use client"

import { useState, useEffect, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import coreTranslations from 'ckeditor5/translations/es.js';
import NextLink from "next/link"

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
	Mention,
	EditorConfig
} from 'ckeditor5';

import { linkConfig, mentionConfig, MentionCustomization } from './markdown-editor';
import "./editor.css"
import InternalLink from "./link/link"
import { validFastPost } from '../utils';
import { SaveDraftButton } from './save-draft-button';


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

export default function FastEditor({onSubmit, onSaveDraft, initialData=""}: any) {
    const [editor, setEditor] = useState<BalloonEditor | null>(null);
	const [validContent, setValidContent] = useState(validFastPost(initialData))

	const editorConfig: EditorConfig = {
		plugins: fastEditorPlugins,
		balloonToolbar: fastEditorBlockToolbar,
		initialData: initialData,
		link: linkConfig,
		placeholder: '...',
        translations: [coreTranslations],
		language: 'es',
		mention: mentionConfig,
		licenseKey: "RWU3cVZxZGdGQnJxb0lQdkJHckRwZ3VQYkNZV1FzdnUrbTFVbDMwaHZVOW5OL2ZxdTRKSUxNK3liWU9VVHc9PS1NakF5TkRBNE1qRT0="
	};


	return <div className="flex flex-col">
		<div className="flex justify-between py-2">
			<NextLink href="/borradores" className="">
				<button className="px-4 py-2 gray-button">
					Mis borradores
				</button>
			</NextLink>
			<div className="flex ">
				<div className="px-2">
					<SaveDraftButton onSaveDraft={onSaveDraft} editor={editor} disabled={!validContent}/>
				</div>
				<button
					onClick={() => {if(editor) onSubmit(editor.getData())}}
					disabled={!validContent}
					className="px-4 rounded font-bold transition duration-200 bg-blue-500 hover:bg-blue-600 text-white enabled:cursor-pointer disabled:bg-gray-400"
				>
					Publicar
				</button>
			</div>
		</div>
		
		<div className="editor-container editor-container_classic-editor editor-container_include-block-toolbar">
			<div className="editor-container__editor">
				<CKEditor
					editor={BalloonEditor}
					config={editorConfig}
					onReady={(editor: any) => {setEditor(editor)}}
					onChange={(event, editor) => {setValidContent(validFastPost(editor.getData()))}}
				/>
			</div>
		</div>
	</div>
}
