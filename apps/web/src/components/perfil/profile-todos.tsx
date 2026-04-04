import {useState} from "react";
import dynamic from "next/dynamic";
import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api"
import {CheckSquareIcon} from "@phosphor-icons/react";
import {getPendingProfileObjectiveLabels} from "./profile-objectives";

const EditProfileMobile = dynamic(() => import('./edit-profile-modal'))


export const ProfileTODOs = ({profile}: {
    profile: ArCabildoabiertoActorDefs.ProfileViewDetailed,
}) => {
    const [editingProfile, setEditingProfile] = useState(false)
    const todos = getPendingProfileObjectiveLabels(profile)

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
