import { useState, useEffect, useRef } from 'react';
import { useUser } from '../user-provider';

import { validSubscription } from '../utils';
import { UserProps } from '@/actions/get-user';
import NeedAccountPopupPanel from '../need-account-popup';
import Popup from '../popup';
import { TextareaAutosize } from '@mui/material';

function canComment(user: UserProps | null | undefined){
	return validSubscription(user)
}

export default function SimpleCommentEditor({onSubmit, onCancel=null}: any) {
    const {user} = useUser()
	const [value, setValue] = useState("")

	async function handleSubmit(){
		if(value.length == 0) return
		await onSubmit(value)
	}

	const SendCommentButton = ({onClick}: any) => {
		const [submitting, setSubmitting] = useState(false)
		return <div className="px-1">
			<button
				onClick={async (e: any) => {setSubmitting(true); await onClick(e); setSubmitting(false)}}
				className="small-btn"
				disabled={submitting}
			>
				{submitting ? "Enviando" : "Enviar"}
			</button>
		</div>
	}

	return <div className="border px-1 py-1 rounded">
		<TextareaAutosize
			className="focus:outline-none w-full resize-none comment-content px-2 py-1"
			value={value}
			onChange={(e) => {setValue(e.target.value)}}
			minRows={2}
			placeholder="Agregá un comentario"
		/>

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
