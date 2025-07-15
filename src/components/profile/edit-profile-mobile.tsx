import {BaseFullscreenPopup} from "../../../modules/ui-utils/src/base-fullscreen-popup";
import {CloseButton} from "../../../modules/ui-utils/src/close-button";
import Image from "next/image";
import React, {ReactNode, useState} from "react";
import {useProfile, useSession} from "@/queries/api";
import {Menu, TextField} from "@mui/material";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import {IconButton} from "../../../modules/ui-utils/src/icon-button";
import {UploadImageButton} from "@/components/writing/write-panel/upload-image-button";
import {ImagePayload} from "@/components/writing/write-panel/write-post";
import {post} from "@/utils/fetch";
import StateButton from "../../../modules/ui-utils/src/state-button";
import {useQueryClient} from "@tanstack/react-query";
import FullscreenImageViewer from "@/components/images/fullscreen-image-viewer";
import Link from "next/link";

type Props = {
    open: boolean,
    onClose: () => void
}


export const UploadImageModalOnClick = ({
                                            children,
                                            setImage,
                                        }: {
    children: ReactNode;
    setImage: (i: ImagePayload) => void;
}) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const onClose = () => {
        setAnchorEl(null);
    };

    return <>
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
            <UploadImageButton onSubmit={(i) => {
                setImage(i);
                onClose()
            }} text={"Subir imagen"}/>
        </Menu>
    </>
};


type UpdateProfileProps = {
    displayName?: string
    description?: string
    banner?: string
    profilePic?: string
}


const EditProfileMobile = ({open, onClose}: Props) => {
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
        await post<UpdateProfileProps, {}>("/profile", {
            displayName: displayName != profile.bsky.displayName ? displayName : undefined,
            banner: banner && banner.$type == "file" ? banner.base64 : undefined,
            profilePic: profilePic && profilePic.$type == "file" ? profilePic.base64 : undefined,
            description: description != profile.bsky.description ? description : undefined
        })
        qc.invalidateQueries({queryKey: ["profile", user.handle]})
        onClose()
        return {}
    }

    return <BaseFullscreenPopup
        open={open}
        onClose={onClose}
        closeButton={false}
    >
        <div className="flex justify-between items-center border-b p-2 min-[600px]:w-[600px] w-screen">
            <div className="flex-1">
                <CloseButton onClose={onClose} size="small" />
            </div>

            <h3 className="text-center flex-1 font-medium">Editar perfil</h3>

            <div className="flex-1 flex justify-end">
                <StateButton
                    size="small"
                    handleClick={onSubmit}
                    text1="Guardar"
                    textClassName="font-semibold"
                />
            </div>
        </div>
        <UploadImageModalOnClick setImage={setBanner}>
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
            <UploadImageModalOnClick setImage={setProfilePic}>
                <div className={"relative"}>
                    <Image
                        src={profilePic.src}
                        width={400}
                        height={400}
                        alt={profile.bsky.handle + " avatar"}
                        className="w-[88px] h-[88px] rounded-full ml-6 mt-[-44px] border cursor-pointer"
                        onClick={e => {e.stopPropagation(); setViewingProfilePic(0)}}
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
        <div className={"my-8 px-8 flex flex-col space-y-8 min-[600px]:w-[600px] w-screen"}>
            <TextField
                value={displayName}
                label={"Nombre visible"}
                size={"small"}
                onChange={(e) => {
                    setDisplayName(e.target.value)
                }}
            />
            <TextField
                value={description}
                label={"Descripción"}
                size={"small"}
                minRows={2}
                multiline={true}
                onChange={(e) => {
                    setDescription(e.target.value)
                }}
            />
            <div className={"w-full flex"}>
            <div className={"text-[var(--text-light)] text-sm"}>
                Si la imagen no queda como querrías, probá <Link href={`https://bsky.app/profile/${profile.bsky.handle}`} target="_blank" className={"hover:underline font-semibold"}>editar tu perfil en Bluesky</Link>, que te permite recortar la imagen.
            </div>
            </div>
        </div>
    </BaseFullscreenPopup>
}


export default EditProfileMobile