"use client"
import { updateEntityContent } from "@/actions/create-entity"
import MyEditor from "@/components/editor/editor"
import { ReadOnlyEditor } from "@/components/editor/readonly_editor"
import { useState } from "react"

const EntityPage = ({entity}) => {
    const [content, setContent] = useState(JSON.parse(entity.text))
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
        <h1 className="text-2xl ml-2 py-8 font-semibold mb-8">
            {entity.name}
        </h1>
        <div className="px-2 mb-2">
            {modify ? <MyEditor
                initialValue={content}
                onChange={(value) => {setContent(value); console.log(value)}}
            /> : 
            <ReadOnlyEditor
                initialValue={content}
                onCommentClick={() => {}}
            />}
        </div>
        <div className="flex justify-between">
            <button className="ml-3 py-2 px-4 rounded font-bold transition duration-200 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer" onClick={handleEdit}>{modify ? "Desactivar edición" : "Activar edición"}</button>
            {modify && <button className="ml-3 py-2 px-4 rounded font-bold transition duration-200 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer" onClick={handleSave}>Guardar</button>}
        </div>
    </>
}

export default EntityPage