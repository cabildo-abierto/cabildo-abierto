"use client"

import { useEffect, useState } from "react"
import { useSWRConfig } from "swr"
import { addAt } from "./content"
import { Description } from "./description"
import SelectionComponent from "./search-selection-component";
import { unfollow, follow } from "../actions/users"
import { UserProps } from "../app/lib/definitions"
import { FixedFakeNewsCounter } from "./fake-news-counter"
import { ArticleIcon } from "./icons"
import { PermissionLevel } from "./permission-level"
import { Button } from "@mui/material"
import StateButton from "./state-button"
import { EditProfileModal } from "./edit-profile-modal"

export function ProfileHeader({profileUser, user, selected, setSelected, setShowingFakeNews }: {profileUser: UserProps, user?: UserProps, selected: string, setSelected: any, setShowingFakeNews: any }) {
    const {mutate} = useSWRConfig()
    const [editProfileOpen, setEditProfileOpen] = useState(false)


    const following = user && user.following.some((u) => u.id === profileUser.id)
    const followerCount = profileUser.followedBy.length

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

    function optionsNodes(o: string, isSelected: boolean){
        return <Button
            variant="text"
            color="inherit"
            fullWidth={true}
            sx={{textTransform: "none",
                background: (isSelected ? "var(--secondary-light)" : undefined)
            }}
        >
            {o}
        </Button>
    }

    const isOwner = isLoggedInUser !== undefined ? isLoggedInUser : false

    return <div className="content-container rounded mt-2 flex flex-col">
        <div className="flex justify-between">
            <div className="ml-2 py-2">
                <h3>
                    {profileUser.name}
                </h3>
                <div className="text-gray-600">
                    {addAt(profileUser.id)}
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
                {isOwner && 
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
        <div className="ml-2 flex mb-1 items-center">
            <div>
            <span className="font-bold">{updatedFollowerCount}</span> {updatedFollowerCount == 1 ? "seguidor" : "seguidores"}
            </div>
            <div className="px-4">
            <span className="font-bold">{followingCount}</span> siguiendo
            </div>
            <div className="px-4 mb-1">
                <FixedFakeNewsCounter count={profileUser._count.contents} onClick={() => {setSelected("Publicaciones"); setShowingFakeNews(true)}}/>
            </div>
            <div className="ml-2 text-sm rounded-lg px-2 py-1 items-end justify-center cursor-default" title="Nivel de permisos en la edición de temas. Hacé 10 ediciones para pasar de Editor aprendiz a Editor.">
                <span className="text-gray-600 mb-1">
                    <ArticleIcon/>
                </span>
                <PermissionLevel
                    level={profileUser.editorStatus}
                    className="text-[var(--text-light)]"
                />
            </div>
        </div>
        <div>
            <SelectionComponent
                selected={selected}
                onSelection={(v) => {setSelected(v); setShowingFakeNews(false)}}
                options={["Publicaciones", "Respuestas", "Ediciones en temas"]}
                optionsNodes={optionsNodes}
                className="profile-feed"
            />
        </div>

        {editProfileOpen && <EditProfileModal onClose={() => {setEditProfileOpen(false)}}/>}
    </div>
}
