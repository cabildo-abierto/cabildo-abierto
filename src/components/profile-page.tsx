"use client"
import {ProfileHeader} from "./profile-header";
import {ProfileFeed} from "./profile-feed";
import React, {useEffect, useState} from "react";
import {useUser} from "../app/hooks/user";
import {ContentProps, SmallContentProps, UserProps} from "../app/lib/definitions";
import {RepliesFeed} from "./replies-feed";
import {WikiFeed} from "./wiki-feed";
import { preload } from "swr";
import { fetcher } from "../app/hooks/utils";

type ProfilePageProps = {
    profileUser: UserProps
}

export const ProfilePage = ({profileUser}: ProfilePageProps) => {
    const loggedInUser = useUser()
    const [selected, setSelected] = useState("Publicaciones")
    useEffect(() => {
        preload("/api/replies-feed/"+profileUser.id, fetcher)
        preload("/api/profile-feed/"+profileUser.id, fetcher)
        preload("/api/edits-feed/"+profileUser.id, fetcher)
    }, [])

    return <div>
        <div className="mb-4">
            <ProfileHeader
                profileUser={profileUser} user={loggedInUser.user}
                setSelected={setSelected}
            />
        </div>
        {selected == "Publicaciones" && <ProfileFeed profileUser={profileUser}/>}
        {selected == "Respuestas" && <RepliesFeed profileUser={profileUser}/>}
        {selected == "Ediciones en artículos públicos" && <WikiFeed profileUser={profileUser}/>}
    </div>
}