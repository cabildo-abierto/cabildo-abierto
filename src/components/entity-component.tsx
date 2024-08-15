import { updateEntityContent } from "@/actions/create-entity"
import React from "react"
import dynamic from 'next/dynamic';
import ReadOnlyContent from "./read-only-content";
import Link from "next/link";

const MarkdownEditor = dynamic(() => import('@/components/editor/wiki-editor'), { ssr: false });

const EditableContent: React.FC<any> = ({ entity, content, handleSave, onCancel }) => {
    return <>
        <div className="flex justify-center items-center px-2 py-2">
            <Link href={"/wiki/"+entity.id}>
                <button
                    className="ml-3 py-2 px-4 rounded transition duration-200 bg-gray-200 hover:bg-gray-300 cursor-pointer"
                    onClick={onCancel}>
                    Cancelar edición
                </button>
            </Link>
        </div>

        <div className="px-2">
            <MarkdownEditor initialData={content.text} onSubmit={handleSave} content={content}/>
        </div>
    </>
}


const EntityComponent: React.FC<any> = ({ content, entity, modify, user}) => {
    const handleSave = async (newText: string) => {
        await updateEntityContent(entity.id, newText, content.id)
    }
    
    return <>
        {modify ? <EditableContent content={content} handleSave={handleSave} entity={entity}/> : 
            <ReadOnlyContent content={content} entity={entity} user={user}/>
        }
        <hr className="mb-8 mt-4"/>
    </>
}

export default EntityComponent