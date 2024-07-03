"use client"
import { updateEntityContent } from "@/actions/create-entity"
import { getEntityById } from "@/actions/get-entity";
import MarkdownContent from "@/components/editor/ckeditor-markdown-content";
import MarkdownEditor from "@/components/editor/markdown-editor";
import ReadOnlyMarkdownEditor from "@/components/editor/read-only-markdown-editor";
import { useEffect, useState } from "react"


const EntityPage = ({entity}) => {
    const [content, setContent] = useState(entity.text)
    const [modify, setModify] = useState(false)

    const handleSave = async (content) => {
        await updateEntityContent(content, entity.id)
        setContent(content)
        setModify(false)
    }

    return <>
        <h2 className="ml-2 py-8">
            {entity.name}
        </h2>
        {modify ? 
            <>
                <div className="flex justify-center items-center px-2 py-2">
                    <button 
                        className="ml-3 py-2 px-4 rounded transition duration-200 bg-gray-200 hover:bg-gray-300 cursor-pointer"
                        onClick={() => {setModify(!modify)}}>
                            Cancelar edición
                    </button>
                </div>
                    
                <div className="px-2">
                    <MarkdownEditor initialData={content} onSubmit={handleSave}/>
                </div>
            </>
        :
            <>
                <div className="flex justify-center items-center px-2 py-2">
                    <button 
                        className="ml-3 py-2 px-4 rounded transition duration-200 bg-gray-200 hover:bg-gray-300 cursor-pointer"
                        onClick={() => {setModify(!modify)}}>
                            Editar
                    </button>
                </div>

                <div className="px-2">
                    <MarkdownContent content={content}/>
                </div>
            </>
        }
    </>
}

export default EntityPage