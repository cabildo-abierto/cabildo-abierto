"use client"
import { updateEntityContent } from "@/actions/create-entity"
import MarkdownContent from "@/components/editor/ckeditor-markdown-content";
import { useState } from "react"
import dynamic from 'next/dynamic';
import NeedAccountPopup from "@/components/need-account-popup";
import useUser from "./use-user";

const MarkdownEditor = dynamic(() => import('@/components/editor/markdown-editor'), { ssr: false });


const EditableContent = ({ content, handleSave, onCancel }) => {
    return <>
        <div className="flex justify-center items-center px-2 py-2">
            <button
                className="ml-3 py-2 px-4 rounded transition duration-200 bg-gray-200 hover:bg-gray-300 cursor-pointer"
                onClick={onCancel}>
                Cancelar edición
            </button>
        </div>

        <div className="px-2">
            <MarkdownEditor initialData={content} onSubmit={handleSave} />
        </div>
    </>
}


const ReadOnlyContent = ({ onEdit, content }) => {
    const user = useUser()

    const EditButton = () => {
        return <button
            className="py-1 px-4 rounded transition duration-200 bg-gray-200 hover:bg-gray-300 cursor-pointer"
            onClick={onEdit}>
            Editar
        </button>
    }

    return <>
        <div className="flex justify-center items-center px-2 py-2">
            <EditButton />
        </div>

        <div className="px-2">
            <MarkdownContent content={content} />
        </div>
    </>
}

const EntityComponent = ({ content, entity}) => {
    const [updatedContent, setUpdatedContent] = useState(content.text)
    const [modify, setModify] = useState(false)

    const handleSave = async (newContent) => {
        await updateEntityContent(newContent, entity.id)
        setUpdatedContent(newContent)
        setModify(false)
    }

    const onEdit = () => {
        setModify(!modify)
    }

    return <>
        {modify ? <EditableContent onCancel={() => { setModify(!modify) }} content={updatedContent} handleSave={handleSave} /> : 
        <ReadOnlyContent onEdit={onEdit} content={updatedContent}/>}
        <hr className="mb-8 mt-4"/>
    </>
}

export default EntityComponent