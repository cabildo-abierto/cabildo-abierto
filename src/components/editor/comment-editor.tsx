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

export default function CommentEditor({onSubmit, onCancel=null}) {
    const [editor, setEditor] = useState(null);
	const editorRef = useRef(null);
	const [isLayoutReady, setIsLayoutReady] = useState(false);

	useEffect(() => {
		setIsLayoutReady(true);

		return () => setIsLayoutReady(false);
	}, []);

	const editorConfig = {
		plugins: fastEditorPlugins,
		blockToolbar: fastEditorBlockToolbar,
		initialData: '',
		link: linkConfig,
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
				{onCancel != null &&
					<div className="px-1">
						<button
							onClick={onCancel}
							className="mr-2 text-gray-600 text-sm hover:text-gray-800"
						>
							Cancelar
						</button>
					</div>
				}
			</div>
		</div>
	</div>
}
