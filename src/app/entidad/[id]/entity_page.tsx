"use client"
import { updateEntityContent } from "@/actions/create-entity"
import MyEditor from "@/app/escribir/editor"
import { ReadOnlyEditor } from "@/app/escribir/readonly_editor"
import { useRouter } from "next/navigation"
import { useState } from "react"

const EntityPage = ({entity}) => {
    const [content, setContent] = useState('')
    const [modify, setModify] = useState(false)
    const router = useRouter()

    const handleSave = () => {
        updateEntityContent(content, entity.id)
        router.refresh()
    }

    return <>
        <h1 className="text-2xl ml-2 py-8 font-semibold mb-8">
            {entity.name}
        </h1>
        <div className="ml-2 mb-2">
            {modify ? <MyEditor
                initialValue={JSON.parse(entity.text)}
                onChange={setContent}
            /> : 
            <ReadOnlyEditor
                initialValue={JSON.parse(entity.text)}
                onCommentClick={() => {}}
            />}
        </div>
        <div className="flex justify-between">
            <button className="ml-3 py-2 px-4 rounded font-bold transition duration-200 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer" onClick={() => setModify(!modify)}>{modify ? "Desactivar edición" : "Activar edición"}</button>
            {modify && <button className="ml-3 py-2 px-4 rounded font-bold transition duration-200 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer" onClick={handleSave}>Guardar</button>}
        
        </div>
    </>
}

export default EntityPage