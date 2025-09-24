import {BaseFullscreenPopup} from "../../../modules/ui-utils/src/base-fullscreen-popup";
import {CloseButton} from "../../../modules/ui-utils/src/close-button";
import Image from "next/image";
import React, {ReactNode, useState} from "react";
import {useSession} from "@/queries/useSession";
import {Menu} from "@mui/material";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import {IconButton} from "../../../modules/ui-utils/src/icon-button";
import {UploadImageButton} from "@/components/writing/write-panel/upload-image-button";
import {ImagePayload} from "@/components/writing/write-panel/write-post";
import {post} from "@/utils/fetch";
import StateButton from "../../../modules/ui-utils/src/state-button";
import {useQueryClient} from "@tanstack/react-query";
import FullscreenImageViewer from "@/components/layout/images/fullscreen-image-viewer";
import {useProfile} from "@/queries/useProfile";
import EditImageModal from "@/components/profile/edit-image-modal";
import InfoPanel from "../../../modules/ui-utils/src/info-panel";
import {AppBskyActorProfile} from "@atproto/api"
import {TextField} from "../../../modules/ui-utils/src/text-field"

type Props = {
    open: boolean,
    onClose: () => void
}


export const UploadImageModalOnClick = ({
                                            children,
                                            setImage,
                                            crop
                                        }: {
    children: ReactNode;
    setImage: (i: ImagePayload) => void;
    crop: "circle" | "rectangle" | "none"
}) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl)
    const [editingImage, setEditingImage] = useState<ImagePayload | null>(null)

    const onClose = () => {
        setAnchorEl(null);
    };

    return <>
        {crop != "none" && editingImage && <EditImageModal
            editingImage={editingImage}
            onClose={() => {setEditingImage(null)}}
            setImage={setImage}
            crop={crop}
        />}
        <div onClick={(e) => setAnchorEl(e.currentTarget)}>
            {children}
        </div>
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            PaperProps={{
                elevation: 0,
                sx: {
                    boxShadow: 'none',
                    // ... other styles
                }
            }}
            sx={{
                '& .MuiPaper-root': {
                    backgroundColor: 'transparent',
                }
            }}
        >
            <UploadImageButton
                onSubmit={(i) => {
                    if(crop != "none") {
                        setEditingImage(i)
                    } else {
                        setImage(i)
                        onClose()
                    }
                }}
                text={"Subir imagen"}
            />
        </Menu>
    </>
};


type UpdateProfileProps = {
    displayName?: string
    description?: string
    banner?: string
    profilePic?: string
}


function validDescription(d: string){
    const p: AppBskyActorProfile.Record = {
        $type: "app.bsky.actor.profile",
        displayName: "test",
        handle: "test",
        description: d
    }
    const res = AppBskyActorProfile.validateRecord(p)
    return res.success
}


const EditProfileModal = ({open, onClose}: Props) => {
    const {user} = useSession()
    const {data: profile} = useProfile(user.handle)
    const [displayName, setDisplayName] = useState(profile.bsky.displayName ?? "")
    const [description, setDescription] = useState(profile.bsky.description ?? "")
    const [viewingProfilePic, setViewingProfilePic] = useState<null | number>(null)
    const [banner, setBanner] = useState<ImagePayload | undefined>(profile.bsky.banner ? {
        $type: "url",
        src: profile.bsky.banner
    } : undefined)
    const [profilePic, setProfilePic] = useState<ImagePayload | undefined>(profile.bsky.avatar ? {
        $type: "url",
        src: profile.bsky.avatar
    } : undefined)
    const qc = useQueryClient()

    async function onSubmit() {
        const {error} = await post<UpdateProfileProps, {}>("/profile", {
            displayName: displayName != profile.bsky.displayName ? displayName : undefined,
            banner: banner && banner.$type == "file" ? banner.base64 : undefined,
            profilePic: profilePic && profilePic.$type == "file" ? profilePic.base64 : undefined,
            description: description != profile.bsky.description ? description : undefined
        })
        if(error) return {error}
        qc.invalidateQueries({queryKey: ["profile", user.handle]})
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
                <CloseButton color="transparent" onClose={onClose} size="small"/>
            </div>

            <div className="text-center flex-1 uppercase font-semibold text-sm">Editar perfil</div>

            <div className="flex-1 flex justify-end">
                <StateButton
                    size="small"
                    handleClick={onSubmit}
                    variant={"outlined"}
                    color={"transparent"}
                    sx={{borderRadius: 0}}
                    text1="Guardar"
                    textClassName="font-semibold"
                    disabled={!isValid}
                />
            </div>
        </div>
        <UploadImageModalOnClick crop="rectangle" setImage={setBanner}>
            <div className={"relative"}>
                {banner ?
                    <Image
                        src={banner.src}
                        width={800}
                        height={300}
                        alt={profile.bsky.handle + " banner"}
                        className="h-[150px] object-cover max-w-[600px] cursor-pointer"
                    /> :
                    <div
                        className={"bg-[var(--background-dark2)] w-full max-[680px]:h-auto h-[150px] cursor-pointer"}/>}
                <div className={"absolute bottom-2 right-4 z-[1000]"}>
                    <IconButton
                        color={"background-dark"}
                        size={"small"}
                    >
                        <CameraAltIcon fontSize={"inherit"}/>
                    </IconButton>
                </div>
            </div>
        </UploadImageModalOnClick>
        <div className={"flex"}>
            <UploadImageModalOnClick crop="circle" setImage={setProfilePic}>
                <div className={"relative"}>
                    <Image
                        src={profilePic.src}
                        width={400}
                        height={400}
                        alt={profile.bsky.handle + " avatar"}
                        className="w-[88px] h-[88px] rounded-full ml-6 mt-[-44px] border cursor-pointer"
                    />
                    <FullscreenImageViewer
                        images={[profilePic.src]}
                        viewing={viewingProfilePic}
                        setViewing={setViewingProfilePic}
                        className={"rounded-full w-full max-w-[80vw] sm:max-w-[500px] aspect-square"}
                    />
                    <div className={"absolute bottom-1 right-1"}>
                        <IconButton
                            color={"background-dark"}
                            size={"small"}
                        >
                            <CameraAltIcon fontSize={"inherit"}/>
                        </IconButton>
                    </div>
                </div>
            </UploadImageModalOnClick>
        </div>
        <div className={"my-8 px-8 pb-8 flex flex-col space-y-8 min-[600px]:w-[600px] w-screen"}>
            <div className={"flex space-x-1 items-start w-full"}>
                <TextField
                    value={displayName}
                    label={"Nombre"}
                    size={"small"}
                    paddingX={"0"}
                    fullWidth={true}
                    onChange={(e) => {
                        setDisplayName(e.target.value)
                    }}
                />
                <InfoPanel
                    text={"Un nombre que puede contener espacios, mayúsculas y otros símbolos. No es necesario que sea único."}
                />
            </div>
            <div className={"space-y-1"}>
                <div className={"flex space-x-1 items-start w-full"}>
                    <TextField
                        fullWidth={true}
                        value={description}
                        label={"Descripción"}
                        size={"small"}
                        paddingX={"16px"}
                        minRows={2}
                        multiline={true}
                        onChange={(e) => {
                            setDescription(e.target.value)
                        }}
                    />
                    <InfoPanel
                        text={"Una descripción sobre vos. Máximo 256 caracteres."}
                    />
                </div>
                {!isValid && <div className={"px-1 text-sm text-[var(--text-light)]"}>
                    La descripción es demasiado larga. No puede tener más de 256 caracteres.
                </div>}
            </div>
        </div>
    </BaseFullscreenPopup>
}


export default EditProfileModal