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
import InfoPanel from "./info-panel"

export function ProfileHeader({profileUser, user, selected, setSelected, setShowingFakeNews }: {profileUser: UserProps, user?: UserProps, selected: string, setSelected: any, setShowingFakeNews: any }) {
    const [following, setFollowing] = useState(false)
    const {mutate} = useSWRConfig()

    useEffect(() => {
        if(user)
            setFollowing(user.following.some((u) => u.id === profileUser.id))
    }, [user, profileUser])

    const doesFollow = user && user.following.some((u) => u.id === profileUser.id)

    const followerCount = profileUser.followedBy.length

    // hay alguna mejor forma de hacer esto?
    const updatedFollowerCount = followerCount + Number(following) - Number(doesFollow)
    const isLoggedInUser = user && user.id == profileUser.id
    const followingCount = profileUser.following.length
    
    const onUnfollow = async () => {
        if(!user) return; 1
        setFollowing(false);
        await unfollow(profileUser.id, user.id);
        mutate("/api/following-feed/"+user.id)
        mutate("/api/user")
    }

    const onFollow = async () => {
        if(!user) return
        setFollowing(true)
        await follow(profileUser.id, user.id)
        mutate("/api/following-feed/"+user.id)
        mutate("/api/user")
    }

    return <div className="content-container mt-2 flex flex-col">
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
                    (following ? <button
                        onClick={onUnfollow}
                        className="gray-btn"
                    >
                        Dejar de seguir
                    </button>
                    :
                    <button
                        onClick={onFollow}
                        className="gray-btn"
                    >
                        Seguir
                    </button>)
                }
            </div>}
        </div>
        <div className="ml-2">
            <Description
                text={profileUser.description}
                isOwner={isLoggedInUser !== undefined ? isLoggedInUser : false}
            />
        </div>
        <div className="flex">
            <div className="ml-2 text-sm rounded-lg bg-[var(--secondary-light)] px-2 py-1 items-center justify-center hover:bg-[var(--secondary-slight)] cursor-default" title="Nivel de permisos en la edición de artículos públicos. Hacé 10 ediciones para pasar de Editor aprendiz a Editor.">
                <span className="text-gray-600 mb-1">
                    <ArticleIcon/>
                </span>
                <PermissionLevel
                    level={profileUser.editorStatus}
                    className="text-[var(--text-light)]"
                />
            </div>
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
        </div>
        <div>
            <SelectionComponent
                selected={selected}
                onSelection={(v) => {setSelected(v); setShowingFakeNews(false)}}
                options={["Publicaciones", "Respuestas", "Ediciones en artículos públicos"]}
                className="main-feed"
            />
        </div>
    </div>
}
