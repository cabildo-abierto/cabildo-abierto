"use client"
import StateButton from "../state-button";

export const SaveDraftButton: React.FC<any> = ({handleSaveDraft, disabled}) => {

	return <StateButton
		onClick={handleSaveDraft}
		disabled={disabled}
		text1="Guardar borrador"
		text2="Guardando..."
		className="py-2 px-4 rounded font-bold transition duration-200 bg-red-500 hover:bg-red-600 text-white enabled:cursor-pointer disabled:bg-gray-400"
	/>
}