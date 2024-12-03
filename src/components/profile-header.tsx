import SelectionComponent from "./search-selection-component";
import { unfollow, follow } from "../actions/users"
import { FixedFakeNewsCounter } from "./fake-news-counter"
import { PermissionLevel } from "./permission-level"
import { Button } from "@mui/material"
import StateButton from "./state-button"
import { EditorStatus } from "@prisma/client"
import Image from 'next/image'
import { ArticleIcon } from "./icons/article-icon"
import { emptyChar } from "./utils";
import ReadOnlyEditor from "./editor/read-only-editor";
import { useUser } from "../app/hooks/user";
import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { UserProps } from "../app/lib/definitions";
import { useState } from "react";


export type FullProfile = {user: UserProps, bskyProfile: ProfileViewDetailed}


type ProfileHeaderProps = {
    profileUser: FullProfile,
    user?: {id: string, following: {id: string}[]}
    selected: string
    setSelected: any
    setShowingFakeNews: any
}


export function ProfileHeader({profileUser, selected, setSelected, setShowingFakeNews }: ProfileHeaderProps) {
    const {user} = useUser()
    const [following, setFollowing] = useState(profileUser.bskyProfile.viewer.following != undefined)
    const followersCount = profileUser.bskyProfile.followersCount

    const isLoggedInUser = user && user.id == profileUser.bskyProfile.did
    const followingCount = profileUser.bskyProfile.followsCount
    
    const onUnfollow = async () => {
        if(!user) return;
        const {error} = await unfollow(profileUser.bskyProfile.viewer.following)
        if(error) return {error}
        setFollowing(false)
        return {}
    }

    const onFollow = async () => {
        if(!user) return
        const {error} = await follow(profileUser.bskyProfile.did)
        if(error) return {error}
        setFollowing(true)
        return {}
    }

    const smallScreen = window.innerWidth < 640

    function optionsNodes(o: string, isSelected: boolean){
        return <div className="text-[var(--text)] w-32">
            <Button
                onClick={() => {}}
                variant="text"
                color="inherit"
                fullWidth={true}
                disableElevation={true}
                sx={{textTransform: "none",
                    paddingY: 0

                }}
            >
                <div className={"pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--primary)] font-semibold border-b-[4px]" : "border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    const isOwner = isLoggedInUser !== undefined ? isLoggedInUser : false

    return <div className="flex flex-col border-b">
        <div>
            {profileUser.bskyProfile.banner ? <Image
                src={profileUser.bskyProfile.banner}
                width={800}
                height={300}
                alt={profileUser.bskyProfile.handle + " banner"}
                className="w-full h-[150px]"
            /> : 
            <div className="w-full h-[150px] bg-slate-200">
                {emptyChar}
            </div>
            }
            <Image
                src={profileUser.bskyProfile.avatar}
                width={400}
                height={400}
                alt={profileUser.bskyProfile.handle + " avatar"}
                className="w-24 h-24 rounded-full ml-6 mt-[-48px]"
            />
        </div>
        <div className="flex justify-between">
            <div className="ml-2 py-2">
                <h3>
                    {profileUser.bskyProfile.displayName}
                </h3>
                <div className="text-gray-600">
                    @{profileUser.bskyProfile.handle}
                </div>
            </div>
            {user && <div className="flex items-center mr-2">
                {!isLoggedInUser &&
                    (following ? <StateButton
                        handleClick={onUnfollow}
                        color="primary"
                        size="small"
                        variant="contained"
                        disableElevation={true}
                        text1="Dejar de seguir"
                    />
                    :
                    <StateButton
                        handleClick={onFollow}
                        color="primary"
                        size="small"
                        variant="contained"
                        disableElevation={true}
                        text1="Seguir"
                    />)
                }
                {/* TO DO: Implement  isOwner && false && 
                    <EditProfileButton/>
                */}
            </div>}
        </div>
        <div className="ml-2 mb-2">
            <ReadOnlyEditor initialData={profileUser.bskyProfile.description}/>
        </div>
        <div className="flex sm:flex-row flex-col px-2 space-y-1 sm:space-y-0 sm:space-x-4 mb-1">

            <div className="flex space-x-2 sm:text-base text-sm items-center">
                <div className="">
                    <span className="font-bold">{followersCount}</span> {followersCount == 1 ? "seguidor" : "seguidores"}
                </div>
                <div className="sm:text-base text-sm">
                    <span className="font-bold">{followingCount}</span> siguiendo
                </div>
            </div>

            <div className="flex items-center text-sm sm:text-base">

                {/* TO DO: Recover <FixedFakeNewsCounter count={profileUser._count.contents} onClick={() => {setSelected("Publicaciones"); setShowingFakeNews(true)}}/>*/}

                <div className="ml-2 text-sm rounded-lg px-2 py-1 flex items-center justify-center cursor-default" title="Nivel de permisos en la edición de temas. Hacé 10 ediciones para pasar de Editor aprendiz a Editor.">
                    <span className="text-gray-600 mb-1">
                        <ArticleIcon/>
                    </span>
                    <PermissionLevel
                        level={profileUser.user.editorStatus}
                        className="text-[var(--text-light)]"
                    />
                </div>
            </div>
        </div>
        <div className="flex">
            <SelectionComponent
                selected={selected}
                onSelection={(v) => {setSelected(v); setShowingFakeNews(false)}}
                options={["Publicaciones", "Respuestas", smallScreen ? "Ediciones" : "Ediciones"]}
                optionsNodes={optionsNodes}
                className="flex"
            />
        </div>

        {/*TO DO editProfileOpen && <EditProfileModal onClose={() => {setEditProfileOpen(false)}}/>*/}
    </div>
}
