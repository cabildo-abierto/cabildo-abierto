"use client"
import { updateEntityContent } from "@/actions/create-entity"
import MarkdownEditor from "@/components/editor/markdown-editor";
import ReadOnlyEditor from "@/components/editor/read-only-editor";
import ReadOnlyMarkdownEditor from "@/components/editor/read-only-markdown-editor";
import MarkdownContent from "@/components/markdown-content"
import { useState } from "react"
import TextareaAutosize from 'react-textarea-autosize';


const EntityPage = ({entity}) => {
    const [content, setContent] = useState(entity.text)
    const [pushedContent, setPushedContent] = useState(content)
    const [modify, setModify] = useState(false)

    const handleSave = async () => {
        await updateEntityContent(content, entity.id)
        setPushedContent(content)
        setModify(false)
    }

    const handleEdit = () => {
        setContent(pushedContent)
        setModify(!modify)
    }

    return <>
        <div className="">
            <h2 className="ml-2 py-8">
                {entity.name}
            </h2>

            <div className="flex justify-center items-center px-2 py-2">
                <div>
                <button 
                    className="ml-3 py-2 px-4 rounded transition duration-200 bg-gray-200 hover:bg-gray-300 cursor-pointer"
                    onClick={handleEdit}>{modify ? "Cancelar" : "Editar"}
                </button>
                {modify && <button className="ml-3 py-2 px-4 rounded transition duration-200 bg-gray-200 hover:bg-gray-300 cursor-pointer" onClick={handleSave}>Guardar</button>}
                </div>
            </div>
            
        </div>
        <div className="px-2 mb-2">
            {modify ? <MarkdownEditor initialData={content} onChange={(x) => {setContent(x);}}/> : 
            <ReadOnlyMarkdownEditor content={content}/>}
        </div>
    </>
}


/*{modify ? <TextareaAutosize 
    className="w-full border-0 focus:outline-none px-1 py-1 resize-none"
    value={content}
    onChange={(e) => {setContent(e.target.value)}}
/> : 
<MarkdownContent content={content}/>}*/

export default EntityPage