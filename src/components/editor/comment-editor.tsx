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
import NeedAccountPopup from '../need-account-popup';
import useUser from '../use-user';

export default function CommentEditor({onSubmit, onCancel=null}) {
    const user = useUser()
    const [editor, setEditor] = useState(null);
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
        ]
	};

	function handleSubmit(){
		if(!user) return
		const data = editor.getData()
		if(data.length == 0) return
		onSubmit(data)
	}

	const SendCommentButton = () => {
		return <div className="px-1">
			<button
				onClick={handleSubmit}
				className="small-btn"
			>
				Enviar
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
				{user ? <SendCommentButton/> :
					<NeedAccountPopup trigger={SendCommentButton()} text="Necesitás una cuenta para agregar comentarios."/>
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
