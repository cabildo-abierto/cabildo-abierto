"use client"

import { useState } from "react"
import { useSWRConfig } from "swr"
import { Description } from "./description"
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


export type ProfileHeaderData = {
    followers: {id: string}[]
    following: {id: string}[]
    avatar: string
    banner: string
    id: string
    handle: string
    displayName: string
    description: string
    editorStatus: EditorStatus
    _count: {contents: number}
}


type ProfileHeaderProps = {
    profileUser: ProfileHeaderData
    user?: {id: string, following: {id: string}[]}
    selected: string
    setSelected: any
    setShowingFakeNews: any
}


export function ProfileHeader({profileUser, user, selected, setSelected, setShowingFakeNews }: ProfileHeaderProps) {
    const {mutate} = useSWRConfig()
    const [editProfileOpen, setEditProfileOpen] = useState(false)

    const following = user && user.following.some((u) => u.id === profileUser.id)
    const followerCount = profileUser.followers.length

    // hay alguna mejor forma de hacer esto?
    const updatedFollowerCount = followerCount
    const isLoggedInUser = user && user.id == profileUser.id
    const followingCount = profileUser.following.length
    
    const onUnfollow = async () => {
        if(!user) return;
        const {error} = await unfollow(profileUser.id, user.id)
        if(error) return {error}
        await mutate("/api/following-feed/"+user.id)
        await mutate("/api/user")
        return {}
    }

    const onFollow = async () => {
        if(!user) return
        const {error} = await follow(profileUser.id, user.id)
        if(error) return {error}
        await mutate("/api/following-feed/"+user.id)
        await mutate("/api/user")
        return {}
    }

    const smallScreen = window.innerWidth < 640

    function optionsNodes(o: string, isSelected: boolean){
        return <Button
            variant="text"
            color="inherit"
            size={smallScreen ? "small" : "medium"}
            fullWidth={true}
            sx={{textTransform: "none",
                background: (isSelected ? "var(--secondary-light)" : undefined)
            }}
        >
            {o}
        </Button>
    }

    const isOwner = isLoggedInUser !== undefined ? isLoggedInUser : false

    return <div className="flex flex-col">
        <div>
            {profileUser.banner ? <Image
                src={profileUser.banner}
                width={800}
                height={300}
                alt={profileUser.handle + " banner"}
                className="w-full h-48"
            /> : 
            <div className="w-full h-48 bg-slate-200">{emptyChar}
            </div>
            }
            <Image
                src={profileUser.avatar}
                width={400}
                height={400}
                alt={profileUser.handle + " avatar"}
                className="w-24 h-24 rounded-full ml-6 mt-[-48px]"
            />
        </div>
        <div className="flex justify-between">
            <div className="ml-2 py-2">
                <h3>
                    {profileUser.displayName}
                </h3>
                <div className="text-gray-600">
                    @{profileUser.handle}
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
                {/* TO DO: Implement */ isOwner && false && 
                    <Button
                        size="small"
                        variant="outlined"
                        sx={{textTransform: "none"}}
                        onClick={() => {setEditProfileOpen(true)}}
                    >
                        Editar perfil
                    </Button>
                }
            </div>}
        </div>
        <div className="ml-2">
            <Description
                text={profileUser.description}
            />
        </div>
        <div className="flex sm:flex-row flex-col px-2 space-y-1 sm:space-y-0 sm:space-x-4 mb-1">

            <div className="flex space-x-2 sm:text-base text-sm items-center">
                <div className="">
                    <span className="font-bold">{updatedFollowerCount}</span> {updatedFollowerCount == 1 ? "seguidor" : "seguidores"}
                </div>
                <div className="sm:text-base text-sm">
                    <span className="font-bold">{followingCount}</span> siguiendo
                </div>
            </div>

            <div className="flex items-center text-sm sm:text-base">

                <FixedFakeNewsCounter count={profileUser._count.contents} onClick={() => {setSelected("Publicaciones"); setShowingFakeNews(true)}}/>

                <div className="ml-2 text-sm rounded-lg px-2 py-1 flex items-center justify-center cursor-default" title="Nivel de permisos en la edición de temas. Hacé 10 ediciones para pasar de Editor aprendiz a Editor.">
                    <span className="text-gray-600 mb-1">
                        <ArticleIcon/>
                    </span>
                    <PermissionLevel
                        level={profileUser.editorStatus}
                        className="text-[var(--text-light)]"
                    />
                </div>
            </div>
        </div>
        <div>
            <SelectionComponent
                selected={selected}
                onSelection={(v) => {setSelected(v); setShowingFakeNews(false)}}
                options={["Publicaciones", "Respuestas", smallScreen ? "Ediciones" : "Ediciones en temas"]}
                optionsNodes={optionsNodes}
                className="flex"
            />
        </div>

        {/*TO DO editProfileOpen && <EditProfileModal onClose={() => {setEditProfileOpen(false)}}/>*/}
    </div>
}
