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
	Table,
	TableCaption,
	TableCellProperties,
	TableColumnResize,
	TableProperties,
	TableToolbar,
	Title,
	Underline,
	Undo,
	Mention,
	Image,
	PictureEditing,
	ImageUpload,
	CloudServices,
	CKBoxImageEdit,
	CKBox,
	EditorConfig
} from 'ckeditor5';

import { headingConfig, linkConfig, mentionConfig, MentionCustomization, tableConfig } from './markdown-editor';
import "./editor.css"

import InternalLink from "./link/link"
import { validPost } from '../utils';
import { SaveDraftButton } from './save-draft-button';

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
	Image, PictureEditing, ImageUpload, CloudServices, CKBox, CKBoxImageEdit,
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


export default function PostEditor({onSubmit, onSaveDraft, initialData=""}: any) {
    const [editor, setEditor] = useState<BalloonEditor | null>(null);
	const [validContent, setValidContent] = useState(validPost(initialData))

	const editorConfig: EditorConfig = {
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
        translations: [coreTranslations],
		image: {
            toolbar: [ 'toggleImageCaption', 'imageTextAlternative', 'ckboxImageEdit' ]
        },
        ckbox: {
            tokenUrl: 'https://114213.cke-cs.com/token/dev/sFEQCpTaxVwDohkZJtbiTWyw4JHshEEgLlXe?limit=10',
            defaultUploadWorkspaceId: 'Iu1BhybZJrt2hWKexpZS'
        },
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
		<div className="editor-container">
			<div className="editor-container__editor ck-content">
				<CKEditor
					editor={BalloonEditor}
					config={editorConfig}
					onReady={(editor: BalloonEditor) => {setEditor(editor);}}
					onChange={(event, editor) => {setValidContent(validPost(editor.getData()))}}
				/>
			</div>
		</div>
	</div>
}
