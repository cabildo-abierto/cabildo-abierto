"use client"
import { useState } from "react"
import ReadOnlyEditor from "./editor/read-only-editor"
import dynamic from "next/dynamic";
import { commentEditorSettings } from "./editor/comment-editor";
import { useUser } from "src/app/hooks/user";
import { useRouter } from "next/navigation";
import { EditorState, LexicalEditor } from "lexical";
import { updateDescription } from "src/actions/actions";
import { useSWRConfig } from "swr";
const MyLexicalEditor = dynamic( () => import( 'src/components/editor/lexical-editor' ), { ssr: false } );



const EditButton = ({onClick, isEmpty}: {onClick: () => void, isEmpty: boolean}) => {
    return <button className="small-btn" onClick={onClick}>
        {isEmpty ? "Agregar una descripción" : "Editar descripción"}
    </button>
}

const DescriptionEditor = ({setEditing}: {setEditing: (arg0: boolean) => void}) => {
    const settings = {...commentEditorSettings}
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)
    const {user} = useUser()
    const {mutate} = useSWRConfig()
    const router = useRouter()

    settings.placeholder = "Tu descripción personal..."
    settings.initialData = user.description
    settings.isAutofocus = true

    async function onSubmit() {
        if(editor){
            await updateDescription(JSON.stringify(editor.getEditorState()), user.id)
            mutate("/api/user")
            setEditing(false)
            window.location.reload()
        }
    }

    return <div>
        <MyLexicalEditor
            settings={settings}
            setEditor={setEditor}
            setEditorState={setEditorState}
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