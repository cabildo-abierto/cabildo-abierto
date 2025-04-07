"use client"
import {ProfileHeader} from "./profile-header";
import {ProfileFeed} from "./profile-feed";
import {useState} from "react";
import {RepliesFeed} from "./replies-feed";
import {WikiFeed} from "./wiki-feed";

import {useFullProfile} from "@/hooks/swr";


export const ProfilePage = ({
    username
}: {
    username: string
}) => {
    const [selected, setSelected] = useState("Publicaciones")
    const {user, atprotoProfile} = useFullProfile(username)

    return <div>
        {atprotoProfile && <ProfileHeader
            selected={selected}
            profileUser={user}
            atprotoProfile={atprotoProfile}
            setSelected={setSelected}
        />}
        {selected == "Publicaciones" && <ProfileFeed
            did={username}
            profileUser={atprotoProfile}
        />}
        {selected == "Respuestas" && <RepliesFeed
            did={username}
            profileUser={atprotoProfile}
        />}
        {selected == "Ediciones" && atprotoProfile && <WikiFeed
            profileUser={atprotoProfile}
        />}
    </div>
}