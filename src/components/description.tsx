"use client"
import { useEffect, useState } from "react"
import ReadOnlyEditor from "./editor/read-only-editor"
import dynamic from "next/dynamic";
import { commentEditorSettings } from "./editor/comment-editor";
import { useRouter } from "next/navigation";
import { EditorState, LexicalEditor } from "lexical";
import { useSWRConfig } from "swr";
import { updateDescription } from "../actions/users";
import { useUser } from "../app/hooks/user";
import { Button } from "@mui/material";
const MyLexicalEditor = dynamic( () => import( './editor/lexical-editor' ), { ssr: false } );



export const DescriptionEditor = ({setEditing}: {setEditing: (arg0: boolean) => void}) => {
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
        <div className="flex justify-end px-1 mb-1 space-x-1">
            <Button size="small" sx={{textTransform: "none"}} onClick={() => {setEditing(false)}}>
                Cancelar
            </Button>
            <Button size="small" sx={{textTransform: "none"}} onClick={onSubmit}>Confirmar</Button>
        </div>
    </div>
}

export const Description = ({text}: {text: string | null}) => {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        setIndex(index+1)
    }, [text])

    return <div className="mb-2" key={index}>
        <ReadOnlyEditor initialData={text}/>
    </div>
}