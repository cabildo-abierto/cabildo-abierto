import {BaseFullscreenPopup} from "../layout/base/base-fullscreen-popup";
import {CloseButton} from "../layout/utils/close-button";
import Image from "next/image";
import React, {useState} from "react";
import {useSession} from "@/queries/getters/useSession";
import {ImagePayload} from "@/components/writing/write-panel/write-post";
import {post} from "@/utils/fetch";
import StateButton from "../layout/utils/state-button";
import {useQueryClient} from "@tanstack/react-query";
import FullscreenImageViewer from "@/components/layout/images/fullscreen-image-viewer";
import {useProfile} from "@/queries/getters/useProfile";
import {AppBskyActorProfile} from "@atproto/api"
import {BaseTextField} from "../layout/base/base-text-field"
import {CameraIcon} from "@phosphor-icons/react";
import {BaseNotIconButton} from "@/components/layout/base/base-not-icon-button";
import {BaseTextArea} from "@/components/layout/base/base-text-area";
import {UploadImageDropdown} from "@/components/profile/upload-image-dropdown";
import { ArCabildoabiertoActorDefs } from "@/lex-api";

type Props = {
    open: boolean,
    onClose: () => void
}


type UpdateProfileProps = {
    displayName?: string
    description?: string
    banner?: string
    profilePic?: string
}


function validDescription(d: string) {
    const p: AppBskyActorProfile.Record = {
        $type: "app.bsky.actor.profile",
        displayName: "test",
        handle: "test",
        description: d
    }
    const res = AppBskyActorProfile.validateRecord(p)
    return res.success
}


const UploadPicButton = () => {
    return <BaseNotIconButton
        size={"small"}
        variant={"outlined"}
        className={"p-1 border-0"}
    >
        <CameraIcon/>
    </BaseNotIconButton>
}


export const EditProfileModalWithProfile = ({open, onClose, profile}: Props & {profile: ArCabildoabiertoActorDefs.ProfileViewDetailed}) => {
    const [displayName, setDisplayName] = useState(profile.displayName ?? "")
    const [description, setDescription] = useState(profile.description ?? "")
    const [viewingProfilePic, setViewingProfilePic] = useState<null | number>(null)
    const [banner, setBanner] = useState<ImagePayload | undefined>(profile.banner ? {
        $type: "url",
        src: profile.banner
    } : undefined)
    const [profilePic, setProfilePic] = useState<ImagePayload | undefined>(profile.avatar ? {
        $type: "url",
        src: profile.avatar
    } : undefined)
    const qc = useQueryClient()

    async function onSubmit() {
        const {error} = await post<UpdateProfileProps, {}>("/profile", {
            displayName: displayName != profile.displayName ? displayName : undefined,
            banner: banner && banner.$type == "file" ? banner.base64 : undefined,
            profilePic: profilePic && profilePic.$type == "file" ? profilePic.base64 : undefined,
            description: description != profile.description ? description : undefined
        })
        if (error) return {error}
        qc.invalidateQueries({queryKey: ["profile", profile.handle]})
        qc.invalidateQueries({queryKey: ["session"]})
        onClose()
        return {}
    }

    const isValid = validDescription(description)

    return <BaseFullscreenPopup
        open={open}
        onClose={onClose}
        closeButton={false}
    >
        <div className="flex justify-between items-center border-b p-2 min-[600px]:w-[600px] w-screen">
            <div className="flex-1">
                <CloseButton onClose={onClose} size="small"/>
            </div>

            <div className="text-center flex-1 uppercase font-semibold text-sm">Editar perfil</div>

            <div className="flex-1 flex justify-end">
                <StateButton
                    size="small"
                    handleClick={onSubmit}
                    variant={"outlined"}
                    textClassName="font-semibold"
                    disabled={!isValid}
                >
                    Guardar
                </StateButton>
            </div>
        </div>
        <UploadImageDropdown crop="rectangle" setImage={setBanner}>
            <div className={"relative"}>
                {banner ?
                    <Image
                        src={banner.src}
                        width={800}
                        height={300}
                        alt={profile.handle + " banner"}
                        className="h-[150px] object-cover max-w-[600px] cursor-pointer"
                    /> :
                    <div
                        className={"bg-[var(--background-dark2)] w-full max-[680px]:h-auto h-[150px] cursor-pointer"}/>}
                <div className={"absolute bottom-2 right-4 z-[1000]"}>
                    <UploadPicButton/>
                </div>
            </div>
        </UploadImageDropdown>
        <div className={"flex"}>
            <UploadImageDropdown crop="circle" setImage={setProfilePic}>
                <div className={"relative"}>
                    <Image
                        src={profilePic.src}
                        width={400}
                        height={400}
                        alt={profile.handle + " avatar"}
                        className="w-[88px] h-[88px] rounded-full ml-6 mt-[-44px] border cursor-pointer"
                    />
                    <FullscreenImageViewer
                        images={[profilePic.src]}
                        viewing={viewingProfilePic}
                        setViewing={setViewingProfilePic}
                        className={"rounded-full w-full max-w-[80vw] sm:max-w-[500px] aspect-square"}
                    />
                    <div className={"absolute bottom-1 right-1"}>
                        <UploadPicButton/>
                    </div>
                </div>
            </UploadImageDropdown>
        </div>
        <div className={"pt-4 pb-8 px-8 flex flex-col space-y-4 min-[600px]:w-[600px] w-screen"}>
            <div className={"flex space-x-1 items-start w-full"}>
                <BaseTextField
                    value={displayName}
                    label={"Nombre"}
                    onChange={(e) => {
                        setDisplayName(e.target.value)
                    }}
                    info={"Un nombre que puede contener espacios, mayúsculas y otros símbolos. No es necesario que sea único."}
                />
            </div>
            <div className={"space-y-1"}>
                <div className={"flex space-x-1 items-start w-full"}>
                    <BaseTextArea
                        value={description}
                        label={"Descripción"}
                        rows={2}
                        onChange={(e) => {
                            setDescription(e.target.value)
                        }}
                        info={"Una descripción sobre vos. Máximo 256 caracteres."}
                    />
                </div>
                {!isValid && <div className={"px-1 text-sm text-[var(--text-light)]"}>
                    La descripción es demasiado larga. No puede tener más de 256 caracteres.
                </div>}
            </div>
        </div>
    </BaseFullscreenPopup>
}


const EditProfileModal = ({open, onClose}: Props) => {
    const {user} = useSession()
    const {data: profile} = useProfile(user.handle)

    if(!profile) return null

    return <EditProfileModalWithProfile
        open={open}
        onClose={onClose}
        profile={profile}
    />
}


export default EditProfileModal