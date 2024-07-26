import { useState, useEffect, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import coreTranslations from 'ckeditor5/translations/es.js';

import {
	BalloonEditor,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import "./editor.css"
import { fastEditorBlockToolbar, fastEditorPlugins } from './fast-editor';
import { linkConfig } from './markdown-editor';
import { useUser } from '../user-provider';
import { validSubscription } from '../utils';
import { UserProps } from '@/actions/get-user';
import NeedAccountPopupPanel from '../need-account-popup';
import Popup from '../popup';

function canComment(user: UserProps | null | undefined){
	return validSubscription(user)
}

export default function CommentEditor({onSubmit, onCancel=null}: any) {
    const {user} = useUser()
    const [editor, setEditor] = useState<BalloonEditor | null>(null);
	const editorRef = useRef(null);
	const [isLayoutReady, setIsLayoutReady] = useState(false);

	useEffect(() => {
		setIsLayoutReady(true);

		return () => setIsLayoutReady(false);
	}, []);

	const editorConfig = {
		plugins: fastEditorPlugins,
		balloonToolbar: fastEditorBlockToolbar,
		initialData: '',
		link: linkConfig,
		placeholder: 'Agregá un comentario...',
        translations: [
            coreTranslations
        ],
		licenseKey: "RWU3cVZxZGdGQnJxb0lQdkJHckRwZ3VQYkNZV1FzdnUrbTFVbDMwaHZVOW5OL2ZxdTRKSUxNK3liWU9VVHc9PS1NakF5TkRBNE1qRT0="
	};

	async function handleSubmit(){
		if(!editor) return
		const data = editor.getData()
		if(data.length == 0) return
		await onSubmit(data)
	}

	const SendCommentButton = ({onClick}: any) => {
		const [submitting, setSubmitting] = useState(false)
		return <div className="px-1">
			<button
				onClick={async () => {setSubmitting(true); await onClick(); setSubmitting(false)}}
				className="small-btn scale-btn"
				disabled={submitting}
			>
				{submitting ? "Enviando" : "Enviar"}
			</button>
		</div>
	}

	return <div ref={editorRef} className="border px-1 py-1 rounded">
		{isLayoutReady && 
		<CKEditor
			editor={BalloonEditor}
			config={editorConfig}
			onReady={setEditor}
		/>}

		<div className="flex justify-end">
			<div className="flex justify-end mt-3">
				{canComment(user) ? <SendCommentButton onClick={handleSubmit}/> :
					<Popup 
						Trigger={SendCommentButton}
						Panel={NeedAccountPopupPanel}
					/>
				}
				{onCancel != null &&
					<div className="px-1">
						<button
							onClick={onCancel}
							className="small-btn"
						>
							Cancelar
						</button>
					</div>
				}
			</div>
		</div>
	</div>
}
