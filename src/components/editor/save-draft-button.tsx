"use client"
import { useState } from "react";

export const SaveDraftButton: React.FC<any> = ({onSaveDraft, editor, disabled}) => {
	const [submitting, setSubmitting] = useState(false)

	return <button
		onClick={async () => {setSubmitting(true); await onSaveDraft(editor.getData()); setSubmitting(false)}}
		disabled={disabled || submitting}
		className="py-2 px-4 rounded font-bold transition duration-200 bg-red-500 hover:bg-red-600 text-white enabled:cursor-pointer disabled:bg-gray-400"
	>
		{submitting ? "Guardando..." : "Guardar borrador"}
	</button>
}