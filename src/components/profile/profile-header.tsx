import {useState} from "react";
import Image from 'next/image'
import Link from "next/link";
import {Profile} from "@/lib/types";
import {PermissionLevel} from "@/components/topics/topic/permission-level"
import SelectionComponent from "@/components/buscar/search-selection-component";
import {Button} from "../../../modules/ui-utils/src/button";
import {ArticleIcon} from "../icons/article-icon"
import {emptyChar} from "@/utils/utils";
import ProfileDescription from "@/components/profile/profile-description";
import {FollowButton} from "@/components/profile/profile-utils";
import {FollowCounters} from "@/components/profile/follow/follow-counters";
import dynamic from "next/dynamic";
import {useSession} from "@/queries/useSession";
import ValidationIcon from "@/components/profile/validation-icon";
import {BackButton} from "../../../modules/ui-utils/src/back-button";
import DescriptionOnHover from "../../../modules/ui-utils/src/description-on-hover";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {ContentCounters} from "./content-counters";

const FullscreenImageViewer = dynamic(() => import('@/components/images/fullscreen-image-viewer'));
const EditProfileMobile = dynamic(() => import('@/components/profile/edit-profile-mobile'))

type ProfileHeaderProps = {
    profile: Profile
    user?: { id: string, following: { id: string }[] }
    selected: string
    setSelected: any
}


function ProfileHeader({
                           profile,
                           selected,
                           setSelected
                       }: ProfileHeaderProps) {
    const [viewingProfilePic, setViewingProfilePic] = useState(null)
    const [viewingBanner, setViewingBanner] = useState(null)
    const [editingProfile, setEditingProfile] = useState(false)
    const {isMobile} = useLayoutConfig()
    const {user} = useSession()
    const inCA = profile && profile.ca && profile.ca.inCA

    const isOwner = profile.bsky.handle == user.handle

    function optionsNodes(o: string, isSelected: boolean) {
        return <div className="text-[var(--text)]">
            <Button
                onClick={() => {
                }}
                variant="text"
                color={"background"}
                fullWidth={true}
                disableElevation={true}
                sx={{
                    textTransform: "none",
                    paddingY: 0,
                    borderRadius: 0,
                }}
            >
                <div
                    className={"pb-1 mx-2 pt-2 text-[0.9rem] font-semibold border-b-[4px] " + (isSelected ? "border-[var(--primary)] text-[var(--text)] border-b-[4px]" : "text-[var(--text-light)] border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    return <div className="flex flex-col border-b">
        <div className={"flex flex-col relative w-full"}>
            <div className={"absolute z-2 top-2 left-2"}>
                <BackButton size={"medium"} color={"background-dark3"}/>
            </div>
            {profile.bsky.banner ?
                <div className={""}>
                    <FullscreenImageViewer
                        images={[profile.bsky.banner]}
                        viewing={viewingBanner}
                        setViewing={setViewingBanner}
                        maxHeight={isMobile ? "100vw" : "80vh"}
                        maxWidth={isMobile ? "100vw" : "80vw"}
                        className={"h-full object-contain"}
                    />
                    <Image
                        src={profile.bsky.banner}
                        width={800}
                        height={300}
                        alt={profile.bsky.handle + " banner"}
                        className="max-[500px]:w-screen max-[680px]:w-[100vw-80px] max-[680px]:h-auto w-full h-[150px] cursor-pointer"
                        onClick={() => {
                            setViewingBanner(0)
                        }}
                    />
                </div> :
                <div className="w-full h-[130px] bg-[var(--background-dark)]">
                    {emptyChar}
                </div>
            }
            {profile.bsky.avatar ? <div className={"flex justify-between"}>
                <FullscreenImageViewer
                    images={[profile.bsky.avatar]}
                    viewing={viewingProfilePic}
                    setViewing={setViewingProfilePic}
                    maxHeight={isMobile ? "95vw" : "70vh"}
                    maxWidth={isMobile ? "95vw" : "70vh"}
                    className={"rounded-full h-full object-contain"}
                />
                <Image
                    src={profile.bsky.avatar}
                    width={400}
                    height={400}
                    alt={profile.bsky.handle + " avatar"}
                    className="w-[88px] h-[88px] rounded-full ml-6 mt-[-44px] border cursor-pointer"
                    onClick={() => {
                        setViewingProfilePic(0)
                    }}
                />
                {isOwner && <div className={"pt-2 pr-1"}>
                    <Button
                        color={"background-dark2"}
                        size={"small"}
                        onClick={() => {
                            setEditingProfile(true)
                        }}
                    >
                        <span className={"font-semibold text-[var(--text-light)]"}>Editar perfil</span>
                    </Button>
                </div>}
                <FollowButton handle={profile.bsky.handle} profile={profile.bsky}/>
            </div> : <div className={"w-24 h-24 ml-6 mt-[-48px]"}>
                {emptyChar}
            </div>}
        </div>
        <div className="flex justify-between pr-1 space-x-2">
            <div className="ml-2 py-2">
                <div className={"flex space-x-1 items-center"}>
                    <div className={"min-[500px]:text-2xl text-lg font-bold"}>
                        {profile.bsky.displayName && profile.bsky.displayName.length > 0 ? profile.bsky.displayName : profile.bsky.handle}
                    </div>
                    <ValidationIcon
                        validation={profile.ca?.validation}
                        handle={profile.bsky.handle}
                    />
                </div>
                <div className="text-[var(--text-light)]">
                    @{profile.bsky.handle}
                </div>
            </div>
        </div>

        {profile.bsky.description && profile.bsky.description.length > 0 && <div className="ml-2 mb-2">
            <ProfileDescription description={profile.bsky.description}/>
        </div>}

        <div className="flex flex-col items-start px-2 space-y-2 mb-1">

            <div>
                <FollowCounters profile={profile}/>

                <ContentCounters profile={profile}/>
            </div>

            <div className="flex text-sm sm:text-base">
                {inCA ? <DescriptionOnHover
                        description={"Nivel de permisos en la edición de temas. Hacé 10 ediciones para pasar de Editor aprendiz a Editor."}>
                        <div
                            className="text-sm rounded-lg px-2 flex items-center justify-center py-1 bg-[var(--background-dark)] cursor-default space-x-1"
                        >
                    <span className="text-[var(--text-light)]">
                        <ArticleIcon color={"inherit"}/>
                    </span>
                            <PermissionLevel
                                level={profile.ca.editorStatus}
                                className="text-[var(--text-light)] font-semibold text-xs"
                            />
                        </div>
                    </DescriptionOnHover> :
                    <span className={"text-[var(--text-light)] text-sm"}>
                        <span>
                            Este usuario todavía no está en Cabildo Abierto.
                        </span> <Link
                        target={"_blank"}
                        rel="noopener noreferrer"
                        onClick={() => {
                            window.open("https://bsky.app/profile/" + profile.bsky.handle, '_blank', 'noopener,noreferrer')
                        }}
                        href={"https://bsky.app/profile/" + profile.bsky.handle}
                        className="hover:underline text-[var(--text-lighter)]"
                    >
                            Ver perfil en Bluesky.
                        </Link>
                    </span>}
            </div>
        </div>
        <div className="flex mt-3 overflow-scroll no-scrollbar">
            <SelectionComponent
                selected={selected}
                onSelection={(v) => {
                    setSelected(v)
                }}
                options={["Publicaciones", "Respuestas", ...(inCA ? ["Ediciones", "Artículos"] : [])]}
                optionsNodes={optionsNodes}
                className="flex"
            />
        </div>
        {editingProfile && <EditProfileMobile
            open={editingProfile}
            onClose={() => {
                setEditingProfile(false)
            }}
        />}
    </div>
}


export default ProfileHeader
