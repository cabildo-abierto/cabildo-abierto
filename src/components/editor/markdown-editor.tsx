import React, { useState, useEffect, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';

import {
	ClassicEditor,
	AccessibilityHelp,
	AutoLink,
	Autosave,
	BalloonToolbar,
	BlockQuote,
	BlockToolbar,
	Bold,
	Essentials,
	Heading,
	HorizontalLine,
	Italic,
	Link,
	List,
	Markdown,
	Mention,
	Paragraph,
	RemoveFormat,
	SelectAll,
	SourceEditing,
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
	Underline,
	Undo,
	Autoformat,
	Image,
	PictureEditing,
	ImageUpload,
	CloudServices,
	CKBoxImageEdit,
	CKBox,
	MentionConfig,
	MentionFeedObjectItem,
	EditorConfig,
	HeadingConfig
} from 'ckeditor5';

import translations from 'ckeditor5/translations/es.js';

import { getUsersMatching } from '@/actions/get-user';

import './markdown-editor.css';
import InternalLink from "./link/link"
import NeedAccountPopup from '../need-account-popup';
import { useUser } from '../user-provider';

const toolbar = {
	items: [
		'undo',
		'redo',
		'|',
		'sourceEditing',
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
		'|',
		'bulletedList',
		'numberedList'
	],
	shouldNotGroupWhenFull: false
}


const plugins = [
	AccessibilityHelp,
	AutoLink,
	Autosave,
	Autoformat,
	BalloonToolbar,
	BlockQuote,
	BlockToolbar,
	Bold,
	Essentials,
	Heading,
	HorizontalLine,
	Italic,
	List,
	Link,
	InternalLink,
	Markdown,
	Mention,
	MentionCustomization,
	Paragraph,
	RemoveFormat,
	SelectAll,
	SourceEditing,
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
	Underline,
	Undo,
	Image,
	PictureEditing,
	ImageUpload,
	CloudServices,
	CKBoxImageEdit,
	CKBox
]


const PublishButton: React.FC<any> = ({onSubmit, editor}) => {
	return <button className="blue-button" onClick={() => {onSubmit(editor.getData())}}>
		Publicar
	</button>
}


export default function MarkdownEditor({initialData, onSubmit}: any) {
    const [editor, setEditor] = useState<ClassicEditor | null>(null);
	const {user} = useUser()

	const editorConfig: EditorConfig = {
		toolbar: toolbar,
		plugins: plugins,
		balloonToolbar: ['bold', 'italic', '|', 'link', 'internal-link', '|', 'bulletedList', 'numberedList'],
		blockToolbar: ['bold', 'italic', '|', 'link', 'internal-link', 'insertTable', '|', 'bulletedList', 'numberedList'],
		heading: headingConfig,
		initialData: initialData,
		language: 'es',
		link: linkConfig,
		mention: mentionConfig,
		placeholder: 'Este artículo está vacío!',
		table: tableConfig,
		translations: [translations],
		image: {
            toolbar: [ 'toggleImageCaption', 'imageTextAlternative', 'ckboxImageEdit' ]
        },
        ckbox: {
            tokenUrl: 'https://114213.cke-cs.com/token/dev/sFEQCpTaxVwDohkZJtbiTWyw4JHshEEgLlXe?limit=10',
            defaultUploadWorkspaceId: 'Iu1BhybZJrt2hWKexpZS'
        },
		licenseKey: "RWU3cVZxZGdGQnJxb0lQdkJHckRwZ3VQYkNZV1FzdnUrbTFVbDMwaHZVOW5OL2ZxdTRKSUxNK3liWU9VVHc9PS1NakF5TkRBNE1qRT0="
	};

	return <div className="ck-content z-0">
		<CKEditor
			editor={ClassicEditor}
			config={editorConfig}
			onReady={(editor: ClassicEditor) => {setEditor(editor)}}
		/>

		<div className="flex justify-end mt-3">
			{user ? <PublishButton onSubmit={onSubmit} editor={editor}/> : 
			<NeedAccountPopup trigger={PublishButton({onSubmit: onSubmit, editor: editor})} text="Para editar el contenido es necesario tener una cuenta" />}
		</div>
	</div>
}


export const tableConfig = {
	contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
}


export const linkConfig = {
	addTargetToExternalLinks: true,
	defaultProtocol: 'https://',
}


export const mentionConfig: MentionConfig = {
	feeds: [
		{
			marker: '@',
			feed: getUsers,
			itemRenderer: userMentionRenderer
		},
	]
}

export const headingConfig: HeadingConfig = {
	options: [
		{
			model: 'paragraph',
			title: 'Paragraph',
			class: 'ck-heading_paragraph'
		},
		{
			model: 'heading1',
			view: 'h1',
			title: 'Heading 1',
			class: 'ck-heading_heading1'
		},
		{
			model: 'heading2',
			view: 'h2',
			title: 'Heading 2',
			class: 'ck-heading_heading2'
		},
		{
			model: 'heading3',
			view: 'h3',
			title: 'Heading 3',
			class: 'ck-heading_heading3'
		},
		{
			model: 'heading4',
			view: 'h4',
			title: 'Heading 4',
			class: 'ck-heading_heading4'
		},
		{
			model: 'heading5',
			view: 'h5',
			title: 'Heading 5',
			class: 'ck-heading_heading5'
		},
		{
			model: 'heading6',
			view: 'h6',
			title: 'Heading 6',
			class: 'ck-heading_heading6'
		}
	]
}


function getUsers(queryText: string): Promise<MentionFeedObjectItem[]> {
    return new Promise( resolve => {
        setTimeout(async () => {
			const users = await getUsersMatching(queryText)

			const userTransform = (user: any): any => {
				return {
					id: user.id,
					name: user.name,
					link: `/perfil/${user.id.slice(1)}`
				}
			}

            resolve(users.slice(0, 10).map(userTransform))
        }, 100 );
    } );
}


function userMentionRenderer(item: any) {
    const itemElement = document.createElement( 'span' );

    itemElement.classList.add( 'custom-item' );
    itemElement.id = `mention-list-item-id-${ item.userId }`;
    itemElement.textContent = `${ item.name } `;

    const usernameElement = document.createElement( 'span' );

    usernameElement.classList.add( 'custom-item-username' );
    usernameElement.textContent = item.id;

    itemElement.appendChild( usernameElement );

    return itemElement;
}



export function MentionCustomization(editor: any) {
    // The upcast converter will convert <a class="mention" href="" data-user-id="">
    // elements to the model 'mention' attribute.
    editor.conversion.for('upcast').elementToAttribute({
        view: {
            name: 'a',
            key: 'data-mention',
            classes: 'mention',
            attributes: {
                href: true,
                'data-user-id': true
            }
        },
        model: {
            key: 'mention',
            value: (viewItem: any) => {
                // The mention feature expects that the mention attribute value
                // in the model is a plain object with a set of additional attributes.
                // In order to create a proper object, use the toMentionAttribute helper method:
                const mentionAttribute = editor.plugins.get('Mention').toMentionAttribute( viewItem, {
                    // Add any other properties that you need.
                    link: viewItem.getAttribute( 'href' ),
                    userId: viewItem.getAttribute( 'data-user-id' )
                } );

                return mentionAttribute;
            }
        },
        converterPriority: 'high'
    } );

    // Downcast the model 'mention' text attribute to a view <a> element.
    editor.conversion.for( 'downcast' ).attributeToElement( {
        model: 'mention',
        view: ( modelAttributeValue: any, { writer }: any ) => {
            // Do not convert empty attributes (lack of value means no mention).
            if ( !modelAttributeValue ) {
                return;
            }

            return writer.createAttributeElement( 'a', {
                class: 'mention',
                'data-mention': modelAttributeValue.id,
                'data-user-id': modelAttributeValue.userId,
                'href': modelAttributeValue.link
            }, {
                // Make mention attribute to be wrapped by other attribute elements.
                priority: 20,
                // Prevent merging mentions together.
                id: modelAttributeValue.uid
            } );
        },
        converterPriority: 'high'
    } );
}