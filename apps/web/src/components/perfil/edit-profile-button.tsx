import {BaseButton} from "@/components/utils/base/base-button";
import React, {useState} from "react";
import {WriteButtonIcon} from "@/components/utils/icons/write-button-icon";
import dynamic from "next/dynamic";
const EditProfileModal = dynamic(() => import('./edit-profile-modal'))

export const EditProfileButton = () => {
    const [editingProfile, setEditingProfile] = useState(false)

    return <>
        <BaseButton
            variant={"outlined"}
            size={"small"}
            onClick={() => {
                setEditingProfile(true)
            }}
            startIcon={<WriteButtonIcon/>}
        >
            Editar
        </BaseButton>

        {editingProfile && <EditProfileModal
            open={editingProfile}
            onClose={() => {
                setEditingProfile(false)
            }}
        />}
    </>
}