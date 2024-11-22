
import { BaseFullscreenPopup } from "./base-fullscreen-popup"
import { useUser } from "../app/hooks/user"
import { useEffect, useState } from "react"
import { commentEditorSettings } from "./editor/comment-editor"
import { LexicalEditor, EditorState } from "lexical"
import dynamic from "next/dynamic"
import { updateDescription, updateName } from "../actions/users"
import { useSWRConfig } from "swr"
import StateButton from "./state-button"
import { NameFormSchema } from "../app/lib/definitions"
const MyLexicalEditor = dynamic( () => import( './editor/lexical-editor' ), { ssr: false } );




export const EditProfileModal = ({onClose}: {onClose: () => void}) => {
    const {user} = useUser()
    const [name, setName] = useState(user.name)

    useEffect(() => {
        setName(user.name)
    }, [user])

    const settings = {...commentEditorSettings}
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined)
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined)

    const {mutate} = useSWRConfig()

    settings.placeholder = "Tu descripción personal..."
    settings.initialData = user.description
    settings.isAutofocus = true

    async function onSave(){
        let newDescription = JSON.stringify(editorState)

        if(user.description != newDescription){
            await updateDescription(newDescription, user.id)
            await mutate("/api/user")
        }

        if(name != user.name){
            await updateName(name, user.id)
        }
        onClose()
        return {}
    }

    const validation = NameFormSchema.safeParse({
        name: name,
    })

    const valid = validation.success

    return <BaseFullscreenPopup open={true} onClose={onClose} closeButton={true}>
        <div className="pb-4 px-4 w-screen lg:w-96 flex flex-col items-center">
            <h2>Editar perfil</h2>

            <div className="ml-2 text-[var(--text-light)] mt-8">
                Nombre
            </div>
            <div className="px-4 mt-2 mb-4">
            <input
                className="border rounded p-2 outline-none"
                value={name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setName(event.target.value);
                }}
            />
            </div>

            {validation.error && <div className="text-center text-[var(--text-light)] text-sm mb-4">
                {validation.error.flatten().fieldErrors.name[0]}
            </div>}

            <div className="ml-2 text-[var(--text-light)]">
                Descripción
            </div>
            <div className="border rounded p-2 mb-8 mt-2 w-full">
                <MyLexicalEditor
                    settings={settings}
                    setEditor={setEditor}
                    setEditorState={setEditorState}
                />
            </div>
            
            <div className="">
            <StateButton
                handleClick={onSave}
                variant="contained"
                sx={{textTransform:"none"}}
                disableElevation={true}
                text1="Guardar cambios"
                disabled={!valid}
            />
            </div>
        </div>
    
    </BaseFullscreenPopup>
}