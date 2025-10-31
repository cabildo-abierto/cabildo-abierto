import {useState} from "react";
import dynamic from "next/dynamic";
import {ArCabildoabiertoActorDefs} from "@/lex-api"
import {CheckSquareIcon} from "@phosphor-icons/react";

const EditProfileMobile = dynamic(() => import('@/components/profile/edit-profile-modal'))


export const ProfileTODOs = ({profile}: {
    profile: ArCabildoabiertoActorDefs.ProfileViewDetailed,
}) => {
    const [editingProfile, setEditingProfile] = useState(false)

    const todos: string[] = []

    if (!profile.displayName) {
        todos.push("Agregá un nombre")
    }

    if (!profile.avatar) {
        todos.push("Agregá una foto de perfil")
    }

    if (!profile.description || profile.description.length == 0) {
        todos.push("Agregá una descripción")
    }

    if (!profile.banner) {
        todos.push("Agregá una foto de portada")
    }

    return <div className={"space-y-1 w-full"}>
        {todos.map((t, i) => {
            return <div
                key={i}
                onClick={() => {setEditingProfile(true)}}
                className={"hover:bg-[var(--background-dark2)] cursor-pointer flex py-1 px-2 border border-[var(--accent-dark)] w-full items-center space-x-2 bg-[var(--background-dark)]"}
            >
                <div>
                    <CheckSquareIcon/>
                </div>
                <div className={"text-sm text-[var(--text-light)]"}>
                    {t}
                </div>
            </div>
        })}
        {editingProfile && <EditProfileMobile
            open={editingProfile}
            onClose={() => {
                setEditingProfile(false)
            }}
        />}
    </div>
}
