import React, {useState} from "react";
import Image from 'next/image'
import Link from "next/link";
import {ArCabildoabiertoActorDefs} from "@/lex-api"
import {PermissionLevel} from "@/components/topics/topic/permission-level"
import SelectionComponent from "@/components/buscar/search-selection-component";
import {emptyChar} from "@/utils/utils";
import ProfileDescription from "@/components/profile/profile-description";
import {FollowButton} from "@/components/profile/follow-button";
import {MessageButton} from "@/components/profile/message-button";
import {FollowCounters} from "@/components/profile/follow/follow-counters";
import dynamic from "next/dynamic";
import {useSession} from "@/queries/getters/useSession";
import ValidationIcon from "@/components/profile/validation-icon";
import DescriptionOnHover from "../layout/utils/description-on-hover";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {ContentCounters} from "./content-counters";
import {bskyProfileUrl} from "@/utils/uri";
import VerifyAccountButton from "@/components/profile/verify-account-button";
import {feedOptionNodes} from "@/components/feed/config/feed-option-nodes";
import ArticleIcon from "@/components/layout/icons/article-icon";
import {EditProfileButton} from "@/components/profile/edit-profile-button";
import {ProfileTODOs} from "@/components/profile/profile-todos";

const FullscreenImageViewer = dynamic(() => import('@/components/layout/images/fullscreen-image-viewer'));


type ProfileHeaderProps = {
    profile: ArCabildoabiertoActorDefs.ProfileViewDetailed
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
    const {isMobile} = useLayoutConfig()
    const {user} = useSession()
    if (!profile) return null
    const inCA = profile && profile.caProfile != null
    const isOwner = user && profile.handle == user.handle


    return <div className="flex flex-col border-b border-[var(--accent-dark)] mt-2">
        <div className={"flex flex-col relative w-full"}>
            {profile.banner ?
                <div className={""}>
                    <FullscreenImageViewer
                        images={[profile.banner]}
                        viewing={viewingBanner}
                        setViewing={setViewingBanner}
                        maxHeight={isMobile ? "100vw" : "80vh"}
                        maxWidth={isMobile ? "100vw" : "80vw"}
                        className={"h-full object-contain"}
                    />
                    <Image
                        src={profile.banner}
                        width={800}
                        height={300}
                        alt={profile.handle + " banner"}
                        className="max-[500px]:w-screen border-t border-b border-r border-l border-[var(--accent-dark)] max-[680px]:w-[100vw-80px] max-[680px]:h-auto w-full h-[150px] cursor-pointer"
                        onClick={() => {
                            setViewingBanner(0)
                        }}
                    />
                </div> :
                <div className="w-full h-[130px] bg-[var(--background-dark)]">
                    {emptyChar}
                </div>
            }
            <div className={"flex justify-between pr-1"}>
                {profile.avatar ? <>
                    <FullscreenImageViewer
                        images={[profile.avatar]}
                        viewing={viewingProfilePic}
                        setViewing={setViewingProfilePic}
                        maxHeight={isMobile ? "95vw" : "70vh"}
                        maxWidth={isMobile ? "95vw" : "70vh"}
                        className={"rounded-full h-full object-contain"}
                    />
                    <Image
                        src={profile.avatar}
                        width={400}
                        height={400}
                        alt={profile.handle + " avatar"}
                        className="w-[88px] h-[88px] rounded-full ml-6 mt-[-44px] border-2 border-[var(--background)] cursor-pointer"
                        onClick={() => {
                            setViewingProfilePic(0)
                        }}
                    />
                </> : <div
                    className={"w-24 h-24 bg-[var(--background-dark)] rounded-full border-2 border-[var(--background)] ml-6 mt-[-48px]"}
                />}

                {isOwner && <div className={"pt-2 pr-1"}>
                    <EditProfileButton/>
                </div>}
                {!isOwner && <div className={"pt-2 pr-1 flex justify-end space-x-2"}>
                    <MessageButton handle={profile.handle}/>
                    <FollowButton handle={profile.handle} profile={profile}/>
                </div>}
            </div>
        </div>
        <div className="flex justify-between pr-1 space-x-2">
            <div className="ml-2 py-2">
                <div className={"flex space-x-1 items-center"}>
                    <div className={"min-[500px]:text-2xl text-lg font-bold break-all"}>
                        {profile.displayName && profile.displayName.length > 0 ? profile.displayName : profile.handle}
                    </div>
                    {isOwner && <VerifyAccountButton verification={profile.verification}/>}
                    <ValidationIcon
                        verification={profile.verification}
                        handle={profile.handle}
                    />
                </div>
                <div className="text-[var(--text-light)]">
                    @{profile.handle}
                </div>
            </div>
        </div>

        {profile.description && profile.description.length > 0 && <div className="ml-2 mb-2">
            <ProfileDescription description={profile.description}/>
        </div>}

        <div className="flex flex-col items-start px-2 space-y-2 mb-1">

            <div>
                <FollowCounters profile={profile}/>

                <ContentCounters profile={profile}/>
            </div>

            <div className="flex text-sm sm:text-base">
                {inCA ? <DescriptionOnHover
                        description={"Nivel de permisos en la edición de temas. Hacé 10 ediciones para pasar de Editor aprendiz a Editor."}
                    >
                        <div
                            className="text-sm bg-[var(--background-dark)] px-2 py-1 flex items-center justify-center cursor-default space-x-1"
                        >
                            <div>
                                <ArticleIcon color={"var(--text-light)"}/>
                            </div>
                            <div>
                                <PermissionLevel
                                    level={profile.editorStatus ?? "Editor principiante"}
                                    className="text-[var(--text-light)] text-xs"
                                />
                            </div>
                        </div>
                    </DescriptionOnHover> :
                    <span className={"text-[var(--text-light)] text-sm"}>
                    <span>
                        Este usuario todavía no está en Cabildo Abierto.
                    </span> <Link
                        target={"_blank"}
                        rel="noopener noreferrer"
                        onClick={() => {
                            window.open(bskyProfileUrl(profile.handle), '_blank', 'noopener,noreferrer')
                        }}
                        href={"https://bsky.app/profile/" + profile.handle}
                        className="hover:underline text-[var(--text-light)]"
                    >
                        Ver perfil en Bluesky.
                    </Link>
                </span>}
            </div>
            {isOwner && <div>
                <ProfileTODOs
                    profile={profile}
                />
            </div>}
        </div>
        <div className="flex mt-3 overflow-scroll no-scrollbar">
            <SelectionComponent
                selected={selected}
                onSelection={(v) => {
                    setSelected(v)
                }}
                options={["Publicaciones", "Respuestas", ...(inCA ? ["Artículos", "Ediciones"] : [])]}
                optionsNodes={feedOptionNodes(40, o => o, "sm:text-[12px] text-[13px]")}
                className="flex"
            />
        </div>
    </div>
}


export default ProfileHeader
