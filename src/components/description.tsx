"use client"
import { useState } from "react"
import ReadOnlyEditor from "./editor/read-only-editor"
import dynamic from "next/dynamic";
import { commentEditorSettings } from "./editor/comment-editor";
import { useUser } from "@/app/hooks/user";
import { useRouter } from "next/navigation";
import { EditorState, LexicalEditor } from "lexical";
import { updateDescription } from "@/actions/create-content";
import { useSWRConfig } from "swr";
const MyLexicalEditor = dynamic( () => import( '@/components/editor/lexical-editor' ), { ssr: false } );



const EditButton = ({onClick, isEmpty}: {onClick: () => void, isEmpty: boolean}) => {
    return <button className="small-btn" onClick={onClick}>
        {isEmpty ? "Agregar una descripción" : "Editar descripción"}

    </button>
}

const DescriptionEditor = ({setEditing}: {setEditing: (arg0: boolean) => void}) => {
    const settings = {...commentEditorSettings}
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorOutput, setEditorOutput] = useState<EditorState | undefined>(undefined)
    const {user} = useUser()
    const {mutate} = useSWRConfig()

    settings.placeholder = "Tu descripción personal..."

    function onSubmit() {
        if(editor && editorOutput){
            editorOutput.read(async () => {
                await updateDescription(JSON.stringify(editorOutput), user.id)
                mutate("/api/user/"+user.id)
            })
        }
        setEditing(false)
    }

    return <div>
        <MyLexicalEditor
            settings={settings}
            setEditor={setEditor}
            setOutput={setEditorOutput}
        />
        <div className="flex justify-end px-1 mb-1">
            <button className="small-btn mr-1" onClick={() => {setEditing(false)}}>Cancelar</button>
            <button className="small-btn" onClick={onSubmit}>Confirmar</button>
        </div>
    </div>
}

const DescriptionReadOnly = ({text, isOwner, setEditing}: 
    {text: string | null, isOwner: boolean, setEditing: (arg0: boolean) => void}) => {
    return <div>
        <ReadOnlyEditor initialData={text}/>

        <div className="flex justify-end px-1 mb-1">
            {isOwner && <EditButton onClick={() => {setEditing(true)}} isEmpty={text === null}/>}
        </div>
    </div>
}

export const Description = ({text, isOwner}: {text: string | null, isOwner: boolean}) => {
    const [editing, setEditing] = useState(false)

    return <div className="mb-2">
            {editing && <DescriptionEditor setEditing={setEditing}/>}
            {!editing && 
            <DescriptionReadOnly text={text} isOwner={isOwner} setEditing={setEditing}/>}
    </div>
}