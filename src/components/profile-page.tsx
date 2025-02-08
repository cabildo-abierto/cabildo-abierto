"use client"
import {ProfileHeader} from "./profile-header";
import {ProfileFeed} from "./profile-feed";
import {useState} from "react";
import {RepliesFeed} from "./replies-feed";
import {WikiFeed} from "./wiki-feed";
import {UserProps} from "../app/lib/definitions";
import {ProfileViewDetailed} from "@atproto/api/dist/client/types/app/bsky/actor/defs";


type ProfilePageProps = {
    profileUser?: UserProps
    atprotoProfile: ProfileViewDetailed
}

export const ProfilePage = ({atprotoProfile, profileUser}: ProfilePageProps) => {
    const [selected, setSelected] = useState("Publicaciones")
    const [showingFakeNews, setShowingFakeNews] = useState(false)

    return <div>
        <ProfileHeader
            setShowingFakeNews={setShowingFakeNews}
            selected={selected}
            profileUser={profileUser}
            atprotoProfile={atprotoProfile}
            setSelected={setSelected}
        />
        {selected == "Publicaciones" && !showingFakeNews && <ProfileFeed profileUser={atprotoProfile} showingFakeNews={false}/>}
        {selected == "Publicaciones" && showingFakeNews && <ProfileFeed profileUser={atprotoProfile} showingFakeNews={true}/>}
        {selected == "Respuestas" && <RepliesFeed profileUser={atprotoProfile}/>}
        {selected == "Ediciones" && <WikiFeed profileUser={atprotoProfile}/>}
    </div>
}